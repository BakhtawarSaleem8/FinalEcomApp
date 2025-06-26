import React from 'react'
import ProductList from '../features/product/components/ProductList'
import NavBar from '../features/navbar/Navbar'
import Footer from '../features/common/Footer'

const ProductListPage = () => {
  return (
    <>
    <NavBar>
    <ProductList></ProductList>
    </NavBar>
    <Footer/>
    </>
  )
}

export default ProductListPage