import mongoose from "mongoose";

const uri = 'mongodb://localhost:27017/wallet?replicaSet=rs'

const User = mongoose.model('User', new mongoose.Schema({
    accountId: String,
    name: String,
    balance: Number
}))

const initUsers = async () => {
    await User.insertMany([
        { accountId: 'ACC001', name: 'John', balance: 50.00 },
        { accountId: 'ACC002', name: 'Jane', balance: 50.00 }
    ])
}

const handleMoneyTransfer = async (senderId: string, receiverId: string, amount: number) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const sender = await User.findOne({ accountId: senderId }).session(session) as any
        console.log({ sender });

        if (sender.balance < amount) {
            throw new Error('Insufficient funds')
        }
        sender.balance -= amount
        await sender.save()

        const receiver = await User.findOne({ accountId: receiverId }).session(session) as any
        console.log({ receiver });

        receiver.balance += amount
        await receiver.save()


        console.log('transfering...');

        setTimeout(async () => {
            await session.commitTransaction()
            session.endSession()
            console.log('transfered!')
        }, 5000)

    } catch (e) {
        await session.abortTransaction()
        console.log(e);
        throw new Error(e)
    }
}

const start = async () => {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    // await initUsers()
    await handleMoneyTransfer('ACC001', 'ACC002', 10)
}

start()