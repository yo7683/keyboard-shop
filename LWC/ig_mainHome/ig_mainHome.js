import { LightningElement, wire, api, track } from 'lwc';

// Apex
import getUserRank from '@salesforce/apex/IG_HomeController.getUserRank';

// Library
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import id from '@salesforce/user/Id';

export default class Ig_mainHome extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference)
    pageRef;
    userId = id;

    isAdmin;
    isManeger;

    connectedCallback(){
        console.log('userId =>  ', this.userId);
        getUserRank({userId: this.userId})
        .then(res => {
            console.log('또이이잉');
            console.log('res =>  ', res);
            if(res == '관리자') this.isAdmin == true;
            else if(res == '매니저') this.isManeger == true;
        })
        .catch(err => {
            console.log('err =>  ', err);
        })
    }

}