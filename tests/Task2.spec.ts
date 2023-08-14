import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, Tuple, TupleBuilder, parseTuple, serializeTuple, toNano } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task2');
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task2 = blockchain.openContract(Task2.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    });

    it('calculates', async () => {
        // const matrix1 = new TupleBuilder();
        // const m1Row1 = new TupleBuilder();
        // m1Row1.writeTuple(
        //     [{ type: 'int', value:  BigInt(1) },
        //     { type: 'int', value:  BigInt(1) }]
        // );
        // m1Row1.build();

        const matrixA : Tuple = { type: 'tuple', items: [
            { type: 'tuple', items:  [
                { type: 'int', value:  1n },
                { type: 'int', value:  1n }
            ] },
            { type: 'tuple', items:  [
                { type: 'int', value:  1n },
                { type: 'int', value:  1n }
            ] },
            { type: 'tuple', items:  [
                { type: 'int', value:  1n },
                { type: 'int', value:  1n }
            ] }
        ] };

        const matrixB : Tuple = { type: 'tuple', items: [
            { type: 'tuple', items:  [
                { type: 'int', value:  1n },
                { type: 'int', value:  1n },
                { type: 'int', value:  1n },
                { type: 'int', value:  1n }
            ] },
            { type: 'tuple', items:  [
                { type: 'int', value:  1n },
                { type: 'int', value:  1n },
                { type: 'int', value:  1n },
                { type: 'int', value:  1n }
            ] }
        ] };

        const { stackReader, stack } = await blockchain.runGetMethod(task2.address, 'matrix_multiplier', [
            matrixA,
            matrixB,
        ]);

        // const res = stackReader;
        const res = stackReader.readTuple();
        console.log(res.readTuple());
        console.log(res.readTuple());
        console.log(res.readTuple());
    });
});
