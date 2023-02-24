import { LightningElement } from 'lwc';

export default class Ig_myProfile extends LightningElement {


    connectedCallback() {
        console.log('myProfile connectedCallback()');
    }
    
    renderedCallback(){
        console.log('Ig_myProfile connectedCallback()');
    }
}