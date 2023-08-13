import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

function toBigInt(buf : Buffer) {
    return BigInt('0x' + buf.toString('hex'));
}

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });

    it('copies', async () => {
        const cellStr = 
            beginCell()
                .storeStringTail("i am")
                .storeRef(
                    beginCell().storeStringTail(" the one! zZ").endCell()
                )
            .endCell();

        const { stackReader } = await blockchain.runGetMethod(task4.address, 'caesar_cipher_encrypt', [
            { type: 'int', value:  BigInt(1) },
            { type: 'cell', cell: cellStr }
        ]);

        // const str01 = cellStr.asSlice().loadBuffer(100);

        // const str1 = cellStr.bits.toString() + cellStr.refs[0].bits.toString();
        // const resCell = stackReader.readCell();
        // const str2 = resCell.bits.toString() + resCell.refs[0].bits.toString();

        // console.log(str01);
        // console.log(str1);
        // console.log(str2);
        

        // expect(
        //     toBigInt(stackReader.readCell().hash())
        // ).toEqual(
        //     toBigInt(targetCell.hash())
        // );
    });
});
