import { LightningElement, wire, track } from 'lwc';

//library
import communityId from '@salesforce/community/Id';
import Id from '@salesforce/user/Id';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

// apex
import getProPurchsedByCustomer from '@salesforce/apex/IG_MyPageController.getProPurchsedByCustomer'

export default class Ig_paymentProduct extends NavigationMixin(LightningElement) {
    
    @wire(CurrentPageReference)
    pageRef;
    @track buyItem = [];               // 구매 상품 관리 변수 
    userId = Id;
    path = '마이페이지 > 결제상품';      // 현재 있는 페이지 경로
    recordId;

    connectedCallback(){
        console.log('Ig_paymentProduct start');
        getProPurchsedByCustomer({userId : this.userId})
        .then(res => {
            res.itemList.forEach(data => {
                try {
                    res.imageList.forEach(imgData => {
                        if(data.productPurchase__c == imgData.RelatedRecordId) {
                            this.buyItem.push({/* orderNum: data.Name */
                                                id : data.productPurchase__c
                                              , image: imgData.ContentDownloadUrl
                                              , count: data.PurchaseCount__c
                                              , price: data.PurchasePrice__c
                                              , paymentDate: data.CreatedDate.split('T')[0]
                                              , name: data.productPurchase__r.Name});                                              
                            throw new Error("stop loop");
                        }
                    });
                } catch(err){}
            });
        })
        .catch(err => {
            console.log('err =>  ', JSON.stringify(err));
        })
    }

    viewDetail(e) {
        this.recordId = e.target.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'productDetail__c'
            },
            state: {
                recordId : this.recordId
            }
        });
    }

    renderedCallback(){

    }
}