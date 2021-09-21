import React from 'react';
import SizeSelector from './SizeSelector.jsx';
import QuantitySelector from './QuantitySelector.jsx';
import axios from 'axios';

class AddToCart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: this.props.style,
      addedToCart: false,
      needSize: false
    };
    this.setSKU = this.setSKU.bind(this);
    this.setQuantity = this.setQuantity.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  setSKU(sku) {
    if (sku === '0') {
      this.setState({
        selectedSKU: null,
        addedToCart: false,
        totalQuantity: 0
      });
    } else {
      this.setState({
        selectedSKU: sku,
        selectedSize: this.state.style.skus[sku].size,
        totalQuantity: this.state.style.skus[sku].quantity,
        addedToCart: false,
        needSize: false
      });
      if (this.state.quantity || this.state.style.skus[sku].quantity < this.state.quantity) {
        // console.log('coming into THIS CASE');
        var quantity = (this.state.style.skus[sku].quantity > 0) ? 1 : 0;
        this.setState({ quantity });
      } else {
        this.setState({ quantity: 1 });
      }
    }
  }

  setQuantity(quantity) {
    this.setState({ quantity, addedToCart: false });
  }

  handleAddToCart(e) {
    e.preventDefault();
    // console.log(event.target.tagName);
    if (this.state.selectedSKU && this.state.quantity <= this.state.totalQuantity) {
      var cartItem = {
        'sku_id': this.state.selectedSKU,
      };
      for (var i = 0; i < this.state.quantity; i++) {
        axios.post('http://localhost:3000/cart/', cartItem)
          .catch((error) => {
            console.error(error);
          });
      }
      this.setState({
        addedToCart: true
      });
    } else {
      this.setState({ needSize: true });
    }
  }

  render() {
    return (
      <div className='po-add-cart'>
        {this.state.needSize ?
          <div className='select-size-msg' >
            You need to select a size first!
          </div>
          : <div className='select-size-msg'> <br /> </div>}
        <div className='select-parent'>
          <div className='select-menus'>
            <SizeSelector
              skus={this.state.style.skus}
              setSKU={this.setSKU}
              needSize={this.state.needSize} />
            <QuantitySelector
              totalQuantity={this.state.totalQuantity}
              setQuantity={this.setQuantity} />
          </div>
          <div className='add-cart-feat'>
            <button
              onClick={this.handleAddToCart} className='button__add-cart' >
              ADD TO CART
            </button>
            <p>{this.state.addedToCart ?
              `You added ${this.state.quantity} items to your cart!`
              : <br />}
            </p>
          </div>
        </div>
        <div><br /><br /><br /></div>
      </div >
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.style !== prevProps.style) {
      this.setState({
        style: this.props.style,
        addedToCart: false,
        selectedSKU: null,
        selectedSize: null,
        totalQuantity: null,
        quantity: null
      });
      // if (this.state.selectedSKU && this.state.style.skus) {
      //   var skuArr = Object.keys(this.props.style.skus);
      //   for (var i = 0; i < skuArr.length; i++) {
      //     if (this.props.style.skus[skuArr[i]].size === this.state.selectedSize) {
      //       this.setState({
      //         selectedSKU: skuArr[i],
      //         totalQuantity: this.props.style.skus[skuArr[i]].quantity
      //       });
      //     }
      //   }
      // }
    }
  }
}

export default AddToCart;
