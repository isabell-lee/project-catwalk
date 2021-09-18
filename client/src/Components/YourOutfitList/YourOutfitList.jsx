import React from 'react';
import Outfit from './YourOutfitCard.jsx';
// import RelatedProductCard from '../RelatedProducts/RelatedProductCard.jsx';
import YourOutfitCard from './YourOutfitCard.jsx';


const axios = require('axios');

class YourOutfitList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productStyles: '',
      productInfo: '',
      outfits: [],
      outfitRenderList: [],
      addOutfit: ''
    };

    this.addOutfit = this.addOutfit.bind(this);
    this.deleteOutfit = this.deleteOutfit.bind(this);
  }

  componentDidMount() {
    this.refeshOutfit();
  }

  refeshOutfit() {
    axios.get('/outfit')
      .then(({ data }) => {
        this.setState({
          outfits: data
        });
      })
      .catch((err) => {
        console.log('Error getting product style in YourOutfit', err);
      });
  }

  addOutfit() {
    const { productId } = this.props;
    axios.post('/outfit', { productId: productId })
      .then(({ data }) => {
        console.log(data);

        this.setState({
          outfits: data
        });
      })
      .catch((err) => {
        console.log('Error getting product style in YourOutfit', err);
      });
  }

  deleteOutfit() {
    const { productId } = this.props;
    const { outfits } = this.state;

    axios.delete(`/outfit/${productId}`)
      .then(({ data }) => {
        outfits.pop(productId);
        this.setState({
          outfits: outfits
        });
      })
      .catch((err) => {
        console.log('Error getting product style in YourOutfit', err);
      });
  }
  render() {
    const { outfits } = this.state;
    let outfitValue = Object.values(outfits);
    return (
      <div>
        <h2>Your outfit</h2>
        <div className="YourOutfit">
          <div className="cardWrapper" onClick={this.addOutfit}>
            <div className='AddOutfitContent card '><span>+ Add To Your Outfit</span>
            </div>
          </div>
          {/* <div className="cardWrapper" onClick={this.deleteOutfit} >
            <div className='AddOutfitContent card '><span>+ Delete To Your Outfit</span>
            </div>
          </div> */}
          {outfitValue.map((productId) => (
            <YourOutfitCard
              productId={productId.productId}
              key={productId}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default YourOutfitList;