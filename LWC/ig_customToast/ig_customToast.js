import { LightningElement, api, track } from 'lwc';

export default class Ig_customToast extends LightningElement {

    @track title;
    @track type;
    @track messsage;
    @api isShowToast;
    @api closeTime = 5000;
    @api isVisibleToast = false;
    
    @api
    showToast(title, message, type) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.isShowToast = true;
        setTimeout(() => this.isShowToast = false, this.closeTime);
    }

    closeModel() {
        this.isShowToast = false;
    }

    renderedCallback() {
        let customMsg = this.template.querySelector('.slds-notify__content > .slds-text-heading_small');
        if(customMsg) {
            customMsg.innerHTML = this.message;
            this.showToast;
        }
        if (this.isShowToast) this.isVisibleToast = true;
        else this.isVisibleToast = false;
    }

    get getIconName() {
        return 'utility:' + this.type;
    }
 
    get innerClass() {
        return 'slds-icon_container slds-icon-utility-' + this.type + ' slds-icon-utility-success slds-m-right_small slds-no-flex';
    }
 
    get outerClass() {
        return 'slds-notify slds-notify_toast slds-theme_' + this.type;
    }
}