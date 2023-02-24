import { LightningElement, api, track } from 'lwc';

export default class Ig_myPage extends LightningElement {

    @track pages = {isPaymentPro: false, isBasket: false, isMyProfile: false};

    connectedCallback(){
        console.log('connectedCallback');
        this.pages.isPaymentPro = true;   // 결제상품 page open
        console.log('this.pages.isPaymentPro =>  ', this.pages.isPaymentPro);
    }
    
    handleCurrentPage(e) {
        console.log('parent e.detail =>  ', e.detail);
        Object.keys(this.pages).forEach(key => {
            console.log('this.pages[key] => ', this.pages[key]);
            this.pages[key] = false;
            if(key == e.detail) this.pages[key] = true;
        });
    }
}