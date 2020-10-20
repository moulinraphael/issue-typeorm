import { createConnection, getConnection, Entity, getRepository, ManyToOne, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Block {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => BlockItem, (blockItem) => blockItem.block)
    blockItems: BlockItem[];
}

@Entity()
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => BlockItem, (blockItem) => blockItem.item)
    blockItems: BlockItem[];
}

@Entity()
export class BlockItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Block, (block) => block.blockItems, { nullable: false })
    block: Block;
  
    @ManyToOne(() => Item, (item) => item.blockItems, { nullable: false })
    item: Item;
}

beforeEach(() => {
    return createConnection({
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        entities: [Block, Item, BlockItem],
        synchronize: true,
        logging: false
    });
});

afterEach(() => {
    let conn = getConnection();
    return conn.close();
});

const fetchBlocksWithItems = async () => await getRepository(Block)
    .createQueryBuilder('b')
    .leftJoinAndSelect('b.blockItems', 'bi')
    .leftJoinAndSelect('bi.item', 'i')
    .getMany();


test("When block has at least one item, blockItems is not empty", async () => {
    const block = await getRepository(Block).save({});
    const item = await getRepository(Item).save({});
    const blockItem = await getRepository(BlockItem).save({ block, item });

    expect(await fetchBlocksWithItems()).toEqual([{
        id: block.id,
        blockItems: [{
            id: blockItem.id,
            item: {
                id: item.id
            }
        }]
    }]);
});


test("When block has no item, blockItems must be an empty array", async () => {
    const block = await getRepository(Block).save({});

    expect(await fetchBlocksWithItems()).toEqual([{
        id: block.id,
        blockItems: [],
    }]);
});
