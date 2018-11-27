export class ProductModel {

    constructor(public readonly id: number) {

    }
    public toMessage() {

        return {id: this.id};
    }
}
