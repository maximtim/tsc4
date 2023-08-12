import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

function toBigInt(buf : Buffer) {
    return BigInt('0x' + buf.toString('hex'));
}

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task1 = blockchain.openContract(Task1.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    });

    it('finds the cell', async () => {
        const targetCell = beginCell().storeUint(42, 6).endCell();

        const tree = 
            beginCell()
                .storeUint(16, 8)
                .storeRef(
                    beginCell().storeUint(101, 8).endCell()
                )
                .storeRef(
                    beginCell()
                        .storeRef(targetCell)
                    .endCell()
                )
            .endCell();

        const { stackReader } = await blockchain.runGetMethod(task1.address, 'find_branch_by_hash', [
            { type: 'int', value:  toBigInt(targetCell.hash()) },
            { type: 'cell', cell: tree }
        ]);

        expect(
            toBigInt(stackReader.readCell().hash())
        ).toEqual(
            toBigInt(targetCell.hash())
        );
    });
});
