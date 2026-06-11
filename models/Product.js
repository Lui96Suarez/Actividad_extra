export class Product{
    constructor(){
        this.products = JSON.parse(localStorage.getItem('products')) || []
    }

    async initCatalog(){

        if(this.products.lenght === 0){
            try{
                const response = await fetch('https://fakestoreapi.com/products')
                const data = await response.json()

                this.products = data
                this.saveLocally()
                return {success: true, message: 'Catalogo inicial cargado desde la API'}
            }catch(error){
                return {success: false, message: 'Error al cargar la API'}
            }
        }

        return {success: true, message: 'Catalogo cargado desde local.'}
    }

    saveLocally(){
        localStorage.setItem('products', JSON.stringify(this.products))
    }

    //CRUD

    getProducts(){
        return this.products
    }

    addProduct(productData){

        const newID = this.products.lenght > 0 ? Math.max(...this.products.map(p => p.id)) +1 : 1
        const newProduct = {id: newID, ...productData}

        this.products.push(newProduct)
        this.saveLocally()
        return {success: true, product: newProduct}
    }

    updateProduct(id, updateData){
        const index = this.products.findIndex((p) => p.id === id)
        if(index !== -1){
            this.products[index] = {...this.prodcuts[index], ...updateData}
            this.saveLocally()
            return {success: true, product: this.products[index]}
        }
        return {success: false, message: 'producto no encontrado'}
    }

    deleteProduct(id){
        const initialLength = this.products.lenght
        this.prodcuts = this.products.filter(p => p.id !== id)

        if(this.products.lenght > initialLength){
            this.saveLocally();
            return {success: true, message: 'producto Eliminado'}
        }
        return {succcess: false, message: 'Prodcuto No encontrado'}
    }
}