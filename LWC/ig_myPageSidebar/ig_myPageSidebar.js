import { LightningElement, track, api } from 'lwc';

import { NavigationMixin, CurrentPageReference } from 'lightning/navigation'



export default class Ig_myPageSidebar extends NavigationMixin(LightningElement) {

    @track navItem=[{menu: '결제상품', eName: 'isPaymentPro'},
                    {menu: '장바구니', eName: 'isBasket'},
                    {menu: '내 정보', eName: 'isMyProfile'}];
    currentItem;

    connectedCallback(){
        console.log('this.navItem =>   ', this.navItem);
        this.currentItem = this.navItem[0].eName;
        console.log(this.navItem[0].eName);
    }


    handleItemNav(e) {
        console.log('e.target.dataset.item =>  ', e.target.dataset.item);
        this.currentItem = e.target.dataset.item;
        const currentItemEvent = new CustomEvent("getcurrentitem", {
            detail: this.currentItem
        });
        this.dispatchEvent(currentItemEvent);
    }
}