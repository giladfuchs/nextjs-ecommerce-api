import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    CreateDateColumn
} from 'typeorm';

@Entity()
export class Collection {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar')
    title!: string;

    @Column('varchar', { unique: true })
    handle!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { unique: true })
    handle!: string;

    @Column('varchar')
    collection!: string;

    @Column('boolean')
    availableForSale!: boolean;

    @Column('varchar')
    title!: string;

    @Column('text')
    description!: string;

    @Column('numeric')
    price!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @OneToMany(() => ProductImage, (image) => image.product)
    images!: ProductImage[];
}

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar')
    url!: string;

    @Column('varchar')
    altText!: string;

    @ManyToOne(() => Product, (product) => product.images, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'product_id' })
    product!: Product;
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar')
    name!: string;

    @Column('varchar')
    email!: string;

    @Column('varchar')
    phone!: string;

    @Column('int')
    totalQuantity!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    cost!: number;

    @OneToMany(() => OrderItem, (item) => item.order, {
        cascade: true,
        eager: true
    })
    items!: OrderItem[];

    @CreateDateColumn()
    createdAt!: Date;
}

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    productId!: number;

    @Column('varchar')
    handle!: string;

    @Column('varchar')
    title!: string;

    @Column('varchar')
    imageUrl!: string;

    @Column('varchar')
    imageAlt!: string;

    @Column('int')
    quantity!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitAmount!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount!: number;

    @ManyToOne(() => Order, (order) => order.items)
    order!: Order;
}
