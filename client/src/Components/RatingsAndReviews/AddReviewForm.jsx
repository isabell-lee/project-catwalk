import React from 'react';
import ReactDom from 'react-dom';
import CharacteristicRadioFormField from './helpers/CharacteristicRadioFormField.jsx';
import StarPicker from './helpers/StarPicker.jsx';
import {PHOTOAPIKEY} from '/client/config.js';
import axios from 'axios';

//Note: Form needs to be revised to require all provided characteristics
var mandatoryFormFields = ['name', 'email', 'rating', 'recommended', 'summary', 'body'];

class AddReviewForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rating: 0,
      summary: '',
      body: '',
      recommended: null,
      name: '',
      email: '',
      characteristics: {},
      photos: [], //hosted photo url
      selectedImages: [], //local url
      files: [], //event.target.files
      submitted: false
    };

    this.closeModal = this.closeModal.bind(this);
    this.handleStringFormChange = this.handleStringFormChange.bind(this);
    this.handleRadioFormChange = this.handleRadioFormChange.bind(this);
    this.submitReviewForm = this.submitReviewForm.bind(this);
    this.handleStarSelect = this.handleStarSelect.bind(this);
    this.createHostedURL = this.createHostedURL.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
  }

  submitReviewForm(event) {
    event.preventDefault();

    var incompleteFields = [];

    for (var property in this.state) {
      if (property === 'submitted') {
        continue;
      }

      if (property !== 'undefined' && !this.state[property]) {
        incompleteFields.push(property);
      }

      var characteristics = {};
      if (property.includes('characteristics-')) {
        let splitProperties = property.split('-');
        let newProperty = splitProperties[1];
        let characteristic_id = this.props.characteristics[newProperty].id;
        // console.log(characteristic_id)
        characteristics[characteristic_id] = parseInt(this.state[property]);
      }

      // if (property.includes('characteristics')) {
      //   var splitInput = property.split('-')
      //   var newProperty = splitInput[1]
      //   dataBody.characteristics[newProperty] = this.state.characteristics[newProperty]
      // }

    }

    var emailReminder =
      !this.state.email.includes('@') ? 'Please enter valid email address.' : '';

    incompleteFields =
      incompleteFields.some((field => mandatoryFormFields.includes(field))) ? 'Please complete all mandatory form fields.' : '';

    var bodyLengthReminder =
      !(this.state.body.length >= 50) ? 'Reiew body must be at least 50 characters' : '';

    if (incompleteFields.length > 0 || emailReminder) {
      alert(`${incompleteFields}\n${emailReminder}\n${bodyLengthReminder}`);

    } else {

      if (this.state.files.length === 0) {
        var photos = [];

      } else {

        var photos = [];

        var photoURLs = (filesArray, cb) => {
          for (var i = 0; i < filesArray.length; i++) {
            let formData = new FormData();
            formData.append('file', filesArray[i]);
            formData.append('upload_preset', PHOTOAPIKEY);

            axios.post('https://api.cloudinary.com/v1_1/drbwyfh4x/upload', formData)
              .then((data) => {
                // url = data.data.secure_url;
                photos.push(data.data.secure_url);
                if (photos.length === filesArray.length) {
                  return cb(null, photos, characteristics);
                }
              })
              .catch((err) => console.log('ERROR in Cloudinary POST Request'));
          }
        };

        photoURLs(this.state.files, (error, data) => {

          var dataBody = {
            "product_id": parseInt(this.props.product_id),
            "rating": parseInt(this.state.rating),
            "summary": this.state.summary + "",
            "body": this.state.body + "",
            "recommend": this.state.recommended === 'No' ? false : true,
            "name": this.state.name,
            "email": this.state.email + "",
            "photos": photos,
            "characteristics": characteristics
          };

          this.props.submitReviewForm(dataBody);


          // var temp = {
          //   "product_id": 40344,
          //   "rating": 5,
          //   "summary": "Very good",
          //   "body": "lorem ipsum",
          //   "recommend": true,
          //   "name": "tester",
          //   "email": "tester@tester.com",
          //   "photos": ["https://res.cloudinary.com/drbwyfh4x/image/upload/v1632328878/pfrvwz00bnqhjympmxg4.png", "https://res.cloudinary.com/drbwyfh4x/image/upload/v1632328889/xggvxej6ojsjn0r4j5eg.png"
          //   ],
          //   "characteristics": {}
          // };
          // this.props.submitReviewForm(temp);
          this.closeModal();

        });
      }
    }
  }

  closeModal() {
    this.props.toggleAddReviewFormVisible();
  }

  setStateProperty(property, value) {
    this.setState({ [property]: value });
  }

  handleStringFormChange(event) {
    this.setStateProperty(event.target.name, event.target.value);
  }

  handleRadioFormChange(event) {
    this.setStateProperty(event.target.name, event.target.id);
  }

  handleStarSelect(name, id) {
    console.log('handlestarselect', name, id);
    this.setStateProperty(name, id);
    this.handleStarColorChange(id);
  }

  handleStarColorChange(ratingValue) {
    return ratingValue <= this.state.rating ? '#ffc107' : '#e4e5e9';
  }

  handleImageChange(event) {
    event.preventDefault();
    if (event.target.files) {
      if (event.target.files.length > 5 || this.state.files.length > 5) {
        return alert('You may only upload up to 5 photos!');
      } else {
        var fileArray = Array.from(event.target.files);

        var selectedImageArray = Array.from(event.target.files).map((file) => URL.createObjectURL(file));

        this.setState(prevState => ({
          selectedImages: prevState.selectedImages.concat(selectedImageArray),
          files: prevState.files.concat(fileArray)
        }));

        Array.from(event.target.files).map((file) => URL.revokeObjectURL(file));
      }
    }
  }

  createHostedURL(image, callback) {
    console.log(image, callback);
    let url;
    let formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', photoAPIKey);
    axios.post('https://api.cloudinary.com/v1_1/drbwyfh4x/upload', formData)
      .then((data) => {
        url = res.data.secure_url;
        return url;
      })
      .catch((err) => { console.log('ERROR in Cloudinary POST Request'); });

  }

  render() {
    let characteristics = this.props.characteristics;
    var characteristicsArray = Object.entries(characteristics);

    if (this.state.submitted) {
      var submissionConfirmation = <h2>Thank you for your feedback</h2>;
    } else {
      var submissionConfirmation = <></>;
    }

    return ReactDom.createPortal(

      <>

        <div className="add-review-modal-wrapper" >
          <div className="add-review-modal-backdrop" onClick={this.closeModal}></div>

          <div className="add-review-modal-box">
            {submissionConfirmation}

            <div className="add-review-form">
              <i className="fas fa-times fa-3x add-review-close-icon-modal" onClick={this.closeModal} />
              <h3>Write Your Review</h3>
              <h4>About {this.props.product_name}</h4><br />
              <form id="review-form" onSubmit={this.submitReviewForm}>

                <div className="form-question">
                  <label className='form-category'>What is your nickname?*</label><br />
                  <input type="text" maxLength={60} placeholder="jackson11!" id="name" name="name" value={this.state.name} onChange={this.handleStringFormChange} required />
                  <small><p>For privacy reasons, do not use your full name or email address</p></small>
                </div>

                <div className="form-question">
                  <label className='form-category'>Your email?*</label><br />
                  <input type="email" maxLength={60} placeholder="jackson11@email.com" id="email" name="email" value={this.state.email} onChange={this.handleStringFormChange} /><br />
                  <small><p>For privacy reasons, do not use your full name or email address</p></small>
                  <small><p>For authentication reasons, you will not be emailed</p></small>
                </div>

                <div className="form-question">
                  <label className="form-category">Overall Rating*</label><br />
                  <StarPicker rating={this.state.rating} handleStarSelect={this.handleStarSelect} />
                </div>

                <div className="form-question" onChange={this.handleRadioFormChange}>
                  <label className="form-category">Do you recommend this product?*</label><br />
                  <label htmlFor="Yes">Yes</label>
                  <input type="radio" id="Yes" name="recommended"></input>
                  <label htmlFor="No">No</label>
                  <input type="radio" id="No" name="recommended"></input>
                </div>

                <div className="form-question">
                  <label className="form-category">Characteristics*</label><br />
                  {characteristicsArray.map((characteristic) => <CharacteristicRadioFormField key={characteristic[1].id} characteristic={characteristic[0]} handleRadioFormChange={this.handleRadioFormChange} />)}
                </div>

                <div className="form-question">
                  <label className="form-category">Review Summary</label><br />
                  <input type="text" placeholder="Best purchase ever!" id="summary" name="summary" value={this.state.summary} onChange={this.handleStringFormChange} />
                </div>

                <div className="form-question">
                  <label className="form-category">Review Body*</label><br />
                  <textarea minLength={50} maxLength={1000} id="body" name="body" value={this.state.body} onChange={this.handleStringFormChange} placeholder="Why did you like the product or not?" /><br />
                  {this.state.body && this.state.body.length >= 50 ? <small>Minimum Reached</small> : <small>Review body must be at least 50 characters. {(50 - this.state.body.length)} characters remaining. </small>}
                </div>

                <div className="form-question">
                  <label className="form-category">Uplaod your photos</label><br />
                  <input type="file" id="select-file" name="filename" className="add-review-modal-button" multiple={true} onChange={this.handleImageChange}></input><br />

                  {this.state.selectedImages && this.state.selectedImages.map((image) => {
                    return <img src={image} key={image} height="80" id="upload-image"></img>;
                  })}

                </div>

                <div className="form-question">
                  <button type="submit" className="add-review-modal-button" onClick={this.submitReviewForm}>Submit Reivew</button>
                  {/* <button type="button" className="add-review-modal-button" onClick={this.closeModal}>Close Window</button> */}
                </div>

              </form>
            </div>
          </div>
        </div>
      </>, document.getElementById('add-review-modal')
    );

  }
}

export default AddReviewForm;


/*
    // this.state = {
    //   'product_id': this.props.product_id,
    //   rating: '',
    //   summary: '',
    //   body: '',
    //   recommended: '',
    //   name: '',
    //   email: '',
    //   photos: [],
    // }

    this.state = {
      rating: 0,
      // submissions: {
      //   'product_id': this.props.product_id,
      //   rating: '',
      //   summary: '',
      //   body: '',
      //   recommended: '',
      //   name: '',
      //   email: '',
      //   photos: [],
      // },
      submitted: false
    }




Radio button alts

{characteristicsArray.map((characteristic) => <CharacteristicRadioFormField key={characteristic[1].id} characteristic={characteristic[0]} handleRadioFormChange={this.handleRadioFormChange}/>)}

            {/* {characteristics.Quality &&
            <>
            <div onChange={this.handleRadioFormChange} className='characteristic-form-field'>
            <h3 className='form-sub-head'>Quality</h3>


            <label htmlFor="1" className='characteristic-form-label'>1</label>
            <input type="radio" id="1" name="characteristics.quality" className='form-radio-button'/>

            <label htmlFor="2" className='characteristic-form-label'>2</label>
            <input type="radio" id="2" name="characteristics.quality" className='form-radio-button'/>

            <label htmlFor="3" className='characteristic-form-label'>3</label>
            <input type="radio" id="3" name="characteristics.quality" className='form-radio-button'/>

            <label htmlFor="4" className='characteristic-form-label'>4</label>
            <input type="radio" id="4" name="characteristics.quality" className='form-radio-button'/>

            <label htmlFor="5" className='characteristic-form-label'>5</label>
            <input type="radio" id="5" name="characteristics.quality" className='form-radio-button'/>

            </div>
            </>

            }


             <div onChange={this.handleRadioFormChange}>Quality
              <label htmlFor="1">1</label>
                <input type="radio" id="1" name="characteristics.quality"></input>
              <label htmlFor="1">2</label>
                <input type="radio" id="2" name="characteristics.quality"></input>
              <label htmlFor="1">3</label>
                <input type="radio" id="3" name="characteristics.quality"></input>
              <label htmlFor="1">4</label>
                <input type="radio" id="4" name="characteristics.quality"></input>
              <label htmlFor="1">5</label>
                <input type="radio" id="5" name="characteristics.quality"></input>
            </div>

*/

/*

    return ReactDom.createPortal(
      <div className="add-review-modal-wrapper" >
        <div className="add-review-modal-backdrop"></div>

        <div className="add-review-modal-box">
        <button type="button" className="add-review-modal-button" onClick={this.closeModal}>Close Window</button>

        <div className="add-review-form">
          <h3>Write Your Review</h3>
          <h4>About {this.props.product_name}</h4><br/>
          <form id="review-form" onSubmit={this.submitReviewForm}>

          <div className="form-question">
            <label className='form-category'>What is your nickmake?*</label><br/>
            <input type="text" maxLength="60" placeholder="jackson11!" id= "name" name="name" value={this.state.name} onChange={this.handleStringFormChange} required/>
            <small><p>For privacy reasons, do not use your full name or email address</p></small>
            </div>

            <div className="form-question">
            <label className='form-category'>Your email?*</label><br/>
            <input type="text" maxLength="60" placeholder="jackson11@email.com" id= "email" name="email" value={this.state.email} onChange={this.handleStringFormChange}/><br/>
            <small><p>For privacy reasons, do not use your full name or email address</p></small>
            <small><p>For authentication reasons, you will not be emailed</p></small>
            </div>

            <div className="form-question">
            <label className="form-category">Overall Rating*</label><br/>
            <input type="number" id="rating" name="rating" placeholder="This to be an interactive star picker" value={this.state.rating} onChange={this.handleStringFormChange}/>
            </div>

            <div className="form-question" onChange={this.handleRadioFormChange}>
            <label className="form-category">Do you recommend this product?*</label><br/>
            <label htmlFor="Yes">Yes</label>
            <input type="radio" id="Yes" name="recommended"></input>
            <label htmlFor="No">No</label>
            <input type="radio" id="No" name="recommended"></input>
            </div>

            <div className="form-question">
              <label className="form-category">Characteristics*</label><br/>
                {characteristicsArray.map((characteristic) => <CharacteristicRadioFormField key={characteristic[1].id} characteristic={characteristic[0]} handleRadioFormChange={this.handleRadioFormChange}/>)}
            </div>

            <div className="form-question">
            <label className="form-category">Review Summary</label><br/>
            <input type="text" placeholder="Best purchase ever!" id="summary" name="summary" value={this.state.summary} onChange={this.handleStringFormChange} />
            </div>

            <div className="form-question">
              <label className="form-category">Review Body*</label><br/>
              <textarea minLength="50" maxLength="1000" id="body" name="body" value={this.state.body} onChange={this.handleStringFormChange} placeholder="Add your review here" />
              {this.state.body && this.state.body.length >= 50 ? <small>Minimum Reached</small> : <small>Review body must be at least 50 characters</small>}
            </div>

            <div className="form-question">
            <label className="form-category">Uplaod your photos</label><br/>
            <input type="file" id="" name="filename"></input>
            <input type="button"></input>
            </div>

            <div className="form-question">
            <button type="submit" className="add-review-modal-button" onClick={this.submitReviewForm}>Submit Reivew</button>
            </div>

          </form>
          </div>
        </div>
      </div>, document.getElementById('add-review-modal')
      );

*/


/*



    if (this.state.submitted = true) {
      var reviewFormDisplay =
        <div className='form-submitted'>Your feedback has been submitted.</div>
    } else {
      var reviewFormDisplay =
      <div className="add-review-modal-wrapper" >
        <div className="add-review-modal-backdrop"></div>

        <div className="add-review-modal-box">
        <button type="button" className="add-review-modal-button" onClick={this.closeModal}>Close Window</button>

        <div className="add-review-form">
          <h3>Write Your Review</h3>
          <h4>About {this.props.product_name}</h4><br/>
          <form id="review-form" onSubmit={this.submitReviewForm}>

          <div className="form-question">
            <label className='form-category'>What is your nickmake?*</label><br/>
            <input type="text" maxLength="60" placeholder="jackson11!" id= "name" name="name" value={this.state.name} onChange={this.handleStringFormChange} required/>
            <small><p>For privacy reasons, do not use your full name or email address</p></small>
            </div>

            <div className="form-question">
            <label className='form-category'>Your email?*</label><br/>
            <input type="text" maxLength="60" placeholder="jackson11@email.com" id= "email" name="email" value={this.state.email} onChange={this.handleStringFormChange}/><br/>
            <small><p>For privacy reasons, do not use your full name or email address</p></small>
            <small><p>For authentication reasons, you will not be emailed</p></small>
            </div>

            <div className="form-question">
            <label className="form-category">Overall Rating*</label><br/>
            <input type="number" id="rating" name="rating" placeholder="This to be an interactive star picker" value={this.state.rating} onChange={this.handleStringFormChange}/>
            </div>

            <div className="form-question" onChange={this.handleRadioFormChange}>
            <label className="form-category">Do you recommend this product?*</label><br/>
            <label htmlFor="Yes">Yes</label>
            <input type="radio" id="Yes" name="recommended"></input>
            <label htmlFor="No">No</label>
            <input type="radio" id="No" name="recommended"></input>
            </div>

            <div className="form-question">
              <label className="form-category">Characteristics*</label><br/>
                {characteristicsArray.map((characteristic) => <CharacteristicRadioFormField key={characteristic[1].id} characteristic={characteristic[0]} handleRadioFormChange={this.handleRadioFormChange}/>)}
            </div>

            <div className="form-question">
            <label className="form-category">Review Summary</label><br/>
            <input type="text" placeholder="Best purchase ever!" id="summary" name="summary" value={this.state.summary} onChange={this.handleStringFormChange} />
            </div>

            <div className="form-question">
              <label className="form-category">Review Body*</label><br/>
              <textarea minLength="50" maxLength="1000" id="body" name="body" value={this.state.body} onChange={this.handleStringFormChange} placeholder="Add your review here" />
              {this.state.body && this.state.body.length >= 50 ? <small>Minimum Reached</small> : <small>Review body must be at least 50 characters</small>}
            </div>

            <div className="form-question">
            <label className="form-category">Uplaod your photos</label><br/>
            <input type="file" id="" name="filename"></input>
            <input type="button"></input>
            </div>

            <div className="form-question">
            <button type="submit" className="add-review-modal-button" onClick={this.submitReviewForm}>Submit Reivew</button>
            </div>

          </form>
          </div>
        </div>
      </div>

    }

    return ReactDom.createPortal(reviewFormDisplay, document.getElementById('add-review-modal'));

    */

    /*


submitReviewForm(event) {
    event.preventDefault();

    let characteristics = {};
    var incompleteFields = [];

    for (var property in this.state) {
      if (property === 'submitted') {
        continue;
      }

      if (property !== 'undefined' && !this.state[property]) {
        incompleteFields.push(property);
      }

      if (property.includes('characteristics-')) {
        let splitProperties = property.split('-');
        let newProperty = splitProperties[1];
        let characteristic_id = this.props.characteristics[newProperty].id;
        // console.log(characteristic_id)
        characteristics[characteristic_id] = parseInt(this.state[property]);
      }

      // if (property.includes('characteristics')) {
      //   var splitInput = property.split('-')
      //   var newProperty = splitInput[1]
      //   dataBody.characteristics[newProperty] = this.state.characteristics[newProperty]
      // }

    }





    var emailReminder =
      !this.state.email.includes('@') ? 'Please enter valid email address.' : '';

    incompleteFields =
      incompleteFields.some((field => mandatoryFormFields.includes(field))) ? 'Please complete all mandatory form fields.' : '';

    var bodyLengthReminder =
      !(this.state.body.length >= 50) ? 'Reiew body must be at least 50 characters' : '';

    if (incompleteFields.length > 0 || emailReminder) {
      // photos =
      //         this.state.files.map((file) => {
      //           return this.createHostedURL(file);
      //         });
      //       console.log(photos);
      alert(`${incompleteFields}\n${emailReminder}\n${bodyLengthReminder}`);

    } else {

      if (this.state.files.length === 0) {
        var photos = [];
      } else {
        var photos = [];
        for (var i = 0; i < this.state.files.length; i++) {
          let url;
          let formData = new FormData();
          formData.append('file', this.state.files[i]);
          formData.append('upload_preset', photoAPIKey);
          axios.post('https://api.cloudinary.com/v1_1/drbwyfh4x/upload', formData)
            .then((data) => {
              url = data.data.secure_url;
              photos.push(url);


              var dataBody = {
                "product_id": parseInt(this.props.product_id),
                "rating": parseInt(this.state.rating),
                "summary": this.state.summary + "",
                "body": this.state.body + "",
                "recommend": this.state.recommended === 'No' ? false : true,
                "name": this.state.name,
                "email": this.state.email + "",
                // "photos": this.state.photos,
                "photos": photos,
                "characteristics": characteristics
                // "characteristics": {}
              };


            })
            .catch((err) => { console.log('ERROR in Cloudinary POST Request'); })

        }
      }













      // if (this.state.files.length === 0) {
      //   var photos = [];
      // } else {
      //   var photos = [];
      //   for (var i = 0; i < this.state.files.length; i++) {
      //     let url;
      //     let formData = new FormData();
      //     formData.append('file', this.state.files[i]);
      //     formData.append('upload_preset', photoAPIKey);
      //     axios.post('https://api.cloudinary.com/v1_1/drbwyfh4x/upload', formData)
      //       .then((data) => {
      //         url = data.data.secure_url;
      //         photos.push(url);
      //       })
      //       .catch((err) => { console.log('ERROR in Cloudinary POST Request'); });
      //   }
      // }



      // var dataBody = {
      //   "product_id": parseInt(this.props.product_id),
      //   "rating": parseInt(this.state.rating),
      //   "summary": this.state.summary + "",
      //   "body": this.state.body + "",
      //   "recommend": this.state.recommended === 'No' ? false : true,
      //   "name": this.state.name,
      //   "email": this.state.email + "",
      //   // "photos": this.state.photos,
      //   "photos": photos,
      //   "characteristics": characteristics
      //   // "characteristics": {}
      // };

      // var temp = {
      //   "product_id": 40344,
      //   "rating": 5,
      //   "summary": "Very good",
      //   "body": "lorem ipsum",
      //   "recommend": true,
      //   "name": "tester",
      //   "email": "tester@tester.com",
      //   "photos": [],
      //   "characteristics": {}
      // };
      // this.props.submitReviewForm(temp)
      this.props.submitReviewForm(dataBody);
      this.closeModal();

      //NOTE:
      //For nested object in state
      // handleRadioFormChange(event){
      //   if (!event.target.name.includes('characteristics')) {
      //       this.setStateProperty(event.target.name, event.target.id)
      //     } else {
      //       let value = event.target.id
      //       let splitProperties = event.target.name.split('.')
      //       let nestedProperty = splitProperties[1]
      //       this.setState(preState => ({
      //         characteristics: prevState.characteristics.map((characteristic) =>
      //           characteristic === nestedProperty ? {...characteristic, nestedProperty: value } : characteristic)
      //       }))
      //     }
      // }

    }
  }
  closeModal() {
    this.props.toggleAddReviewFormVisible();
  }

  setStateProperty(property, value) {
    this.setState({ [property]: value });
  }

  handleStringFormChange(event) {
    this.setStateProperty(event.target.name, event.target.value);
  }

  handleRadioFormChange(event) {
    this.setStateProperty(event.target.name, event.target.id);
  }

  handleStarSelect(name, id) {
    console.log('handlestarselect', name, id);
    this.setStateProperty(name, id);
    this.handleStarColorChange(id);
  }

  handleStarColorChange(ratingValue) {
    return ratingValue <= this.state.rating ? '#ffc107' : '#e4e5e9';
  }

  handleImageChange(event) {
    event.preventDefault();
    if (event.target.files) {
      if (event.target.files.length > 5 || this.state.files.length > 5) {
        return alert('You may only upload up to 5 photos!');
      } else {
        var fileArray = Array.from(event.target.files);

        var selectedImageArray = Array.from(event.target.files).map((file) => URL.createObjectURL(file));

        this.setState(prevState => ({
          selectedImages: prevState.selectedImages.concat(selectedImageArray),
          files: prevState.files.concat(fileArray)
        }));

        Array.from(event.target.files).map((file) => URL.revokeObjectURL(file));
      }
    }
  }

  createHostedURL(image, callback) {
    console.log(image, callback);
    let url;
    let formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', photoAPIKey);
    axios.post('https://api.cloudinary.com/v1_1/drbwyfh4x/upload', formData)
      .then((data) => {
        url = res.data.secure_url;
        return url;
      })
      .catch((err) => { console.log('ERROR in Cloudinary POST Request'); });

  }

  render() {

    */