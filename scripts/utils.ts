type Collection = {
    title: string;
    handle: string;
    updatedAt: string;

};
export type Image = {
    url: string;
    altText: string;
};



export type Product = {
    id: string;
    handle: string;
    collection: string;
    availableForSale: boolean;
    title: string;
    description: string;
    price: string;
    featuredImage: Image;
    images: Image[];
    updatedAt: string;
};
//   updatedAt  should be time
