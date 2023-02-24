import { LightningElement, wire, api, track } from 'lwc';

// Apex
import userLogin from '@salesforce/apex/IG_UserLoginController.userLogin';

// Library
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Ig_loginForm extends NavigationMixin(LightningElement) {
    
    @wire(CurrentPageReference)
    pageRef;
    
    @track userId;
    @track userPwd;
    startUrl;

    connectedCallback() {
        this.startUrl = this.pageRef.state.startURL;
        console.log('this.startUrl =>  ', this.startUrl);
    }

    handleUserId(e) {
        const enterKey = e.keyCode === 13;
        this.userId = e.target.value;
        console.log('this.userId =>  ', this.userId);
        console.log('enterKey =>  ', enterKey);

        if(enterKey) this.template.querySelector('input[type="password"]').focus();
    }

    handleUserPwd(e) {
        const enterKey = e.keyCode === 13;
        this.userPwd = e.target.value;
        console.log('this.userPwd =>  ', this.userPwd);

        if(enterKey) this.doLogin();
    }

    // 회원가입 이동
    moveSignUp() {
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "Register"
            }
        });
    }

    // 비밀번호 찾기 이동
    findPassword() {
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "Forgot_Password"
            }
        });
    }

    // 로그인
    doLogin() {
        userLogin({id: this.userId, pwd: this.userPwd, startURL: this.startUrl})
        .then(res => {
            console.log('res =>  ', res);
            if(res) location.href = res;
            else this.template.querySelector('c-ig_custom-toast').showToast('', '로그인 실패 <br>이메일 혹은 비밀번호가 틀렸습니다.', 'error');
        })
        .catch(err => {
            console.log('err =>  ', err);            
        })
    }

    showToast() {        
        const event = new ShowToastEvent({
            title: '이래도 안나와?',
            variant: 'error',
            message: '진짜 안나와?',
        });
        this.dispatchEvent(event);
    }

}