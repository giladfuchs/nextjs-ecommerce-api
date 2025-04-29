import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Collection {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("varchar")
    title!: string;

    @Column("varchar", { unique: true })
    handle!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("varchar", { unique: true })
    handle!: string;

    @Column("varchar")
    collection!: string;

    @Column("boolean")
    availableForSale!: boolean;

    @Column("varchar")
    title!: string;

    @Column("text")
    description!: string;

    @Column("numeric")
    price!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;

    @OneToMany(() => ProductImage, (image) => image.product)
    images!: ProductImage[];
}

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("varchar")
    url!: string;

    @Column("varchar")
    altText!: string;

    @ManyToOne(() => Product, (product) => product.images, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "product_id" })
    product!: Product;
}
