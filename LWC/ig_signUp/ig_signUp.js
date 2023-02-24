import { LightningElement, track, api, wire } from 'lwc';

// Apex
import validUserNickName from '@salesforce/apex/IG_SignUpController.validUserNickName';
import signUp from '@salesforce/apex/IG_SignUpController.signUp';

// Library
import { CloseActionScreenEvent } from 'lightning/actions';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation'

export default class Ig_signUp extends NavigationMixin(LightningElement) {
    userEmail;                      // 사용자 이메일
    isValidEmail;                   // 사용자 이메일 사용 가능 여부
    validEmailMessage;              // 이메일 사용 가능 여부 메세지
    userPassword;                   // 사용자 비밀번호
    isPasswordReg;                  // 비밀번호 규정 적합 여부
    validPwdMessage;                // 비밀번호 규정 적합 여부 메세지
    isValidatePwd;                  // 사용자 비밀번호 재확인 일치 여부
    doubleCheckPwdMessage;          // 사용자 비밀번호 재확인 일치 여부 메세지
    userName;                       // 사용자 이름
    isValidUserName;                // 사용자 이름 사용가능 여부
    validUserNameMessage;           // 사용자 이름 사용가능 여부 메세지
    userNickName;                   // 사용자 닉네임
    isValidNickName;                // 사용자 닉네임 중복 여부
    isValidNickNameCheck;           // 사용자 닉네임 중복체크 여부
    userBirth;                      // 사용자 생년월일
    @track userPhone;               // 사용자 휴대폰 번호
    isValidPhone                    // 휴대폰 번호 규정 적합 여부    
    ranNum;                         // 랜덤 숫자 4자리
    isValidConfirm                  // 인증번호 확인 일치여부
    confirmMessage                  // 인증번호 일치여부 메세지
    validNickNameMessage            // nickname 사용 여부 메세지


    connectedCallback(){    
        
    }

    // 이메일
    setUserEmail(e) {
        let emailReg = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        console.log('email => ', e.target.value);
        this.userEmail = e.target.value;
        if(emailReg.test(this.userEmail)) {
            this.isValidEmail = true;       // 사용 가능
            this.validEmailMessage = '사용 가능한 이메일 입니다.';
        } else {
            this.isValidEmail = false;      // 사용 불가능
            this.validEmailMessage = '사용 불가능한 이메일 입니다.';
        } 
    }
    
    // 비밀번호
    setUserPwd(e) {
        console.log('password => ', e.target.value);
        const reg = /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,24}$/; 
        console.log('password => ', e.target.value);
        this.userPassword = e.target.value;
        if(reg.test(this.userPassword)) {
            this.isPasswordReg = true;
            this.validPwdMessage = '사용 가능한 비밀번호 입니다.';
        } else {
            this.isPasswordReg = false;
            this.validPwdMessage = '사용 불가능한 비밀번호 입니다.';
        }

        let validPwdEle = this.template.querySelector('.pwd-valid-input');
        if(this.isPasswordReg) validPwdEle.disabled  = false;
        else validPwdEle.disabled  = true;
    }

    // 비밀번호 재확인
    validatePwd(e) {
        console.log('validate password => ', e.target.value);
        if(e.target.value === this.userPassword) {            
            this.isValidatePwd = true;
            this.doubleCheckPwdMessage = '비밀번호 일치';
        }
        else {
            this.isValidatePwd = false;
            this.doubleCheckPwdMessage = '비밀번호 불일치';
        }
    }

    // 이름
    setUserName(e) {
        console.log('user name => ', e.target.value);
        this.userName = e.target.value;
        let nameReg = /^[가-힣]{2,6}$/
        if(nameReg.test(this.userName)) {
            this.isValidUserName = true;
            this.validUserNameMessage = '';
        } else {
            this.isValidUserName = false;
            this.validUserNameMessage = '사용자님의 이름을 다시 한번 확인해 주세요.'
        }
    }

    // 닉네임
    setUserNickName(e) {
        console.log('user nickName => ', e.target.value);
        this.userNickName = e.target.value.replace(/\s/g, "");
        this.isValidNickName = false;
    }
    
    // 닉네임 중복 확인
    validUserNickName() {
        if(!this.userNickName) this.validNickNameMessage = '닉네임을 입력해 주세요.';
        else {
            validUserNickName({nickName : this.userNickName})
            .then(result => {
                if(result) {
                    this.isValidNickName = true;
                    this.isValidNickNameCheck = false;
                    this.validNickNameMessage = '중복된 닉네임 입니다.';
                } else {
                    this.isValidNickName = false;
                    this.isValidNickNameCheck = true;
                    this.validNickNameMessage = '사용가능한 닉네임 입니다.';                
                }
            })
            .catch(error => {
                console.log('error =>', error);
            })
        }
    }

    // 생년월일
    setUserBirth(e) {
        console.log('user birth => ', e.target.value);
        this.userBirth = e.target.value;
    }

    // 휴대폰
    setUserPhone(e) {
        console.log('user phone => ', e.target.value);
        var patternPhone = /^01([0|1|6|7|8|9]?)?([0-9]{3,4})?([0-9]{4})$/;
        this.userPhone = e.target.value;
        if(patternPhone.test(this.userPhone)) this.isValidPhone = true;
        else this.isValidPhone = false;
    }

    randomNum() {
        let str = '';
        for (let i = 0; i < 4; i++) {
            str += Math.floor(Math.random() * 10);
        }
        return str;
    }

    validatePhoneNum() {
        console.log('inside validatePhoneNum');
        this.ranNum = this.randomNum();
        const testerId = 'gyu9189@naver.com';
        const testerPwd = 'Wjsdlfrb123!!';
        const testerNum = '01092763494';
        const text = '인증번호 [' + this.ranNum + '] 를 입력 해주세요.';
        const requestUrl = 'https://api.coolsms.co.kr/sms/1.5/send?user=' + testerId + '&password=' + testerPwd + '&to=' + this.userPhone + '&from=' + testerNum + '&text=' + text + '&type=SMS';
        const verify = window.open(requestUrl, '_blank', 'width=1px; height=1px; top=2000px; left=2000px');
        setTimeout(() => verify.close(), 100);

        if(verify == 'null') this.template.querySelector('c-ig_custom-toast').showToast('', '인증번호 발송에 실패 하였습니다. 재시도 해주세요.', 'warning');
        else this.template.querySelector('c-ig_custom-toast').showToast('', '인증번호가 발송 되었습니다.', 'success');
        console.log(this.ranNum);
    }

    // 인증번호 번호 일치 확인
    confirmValidatePhone(e) {
        console.log(e.target.value);
        let confirmNum = this.template.querySelector('.phone-validate-input');
        if(this.ranNum == confirmNum.value)  {
            this.confirmMessage = '[인증 성공] 인증번호가 일치 합니다.';
            this.isValidConfirm = true;
        } else {
            this.confirmMessage = '[인증 실패] 인증번호가 일치하지 않습니다.';
            this.isValidConfirm = false;
        }
    }

    termsCheckHandle(e) {
        console.log(e.target.id);
        console.log(e.target.checked);
        if(e.target.id.includes('yes')) this.isTermsCheck = true;
        else this.isTermsCheck = false;
        
        var checkEles = this.template.querySelectorAll('.terms-checkbox');
        checkEles.forEach(ele => {
            if(ele.id != e.target.id) ele.checked = false;
        });        
    }

    submit() {
        if(!this.isTermsCheck) this.template.querySelector('c-ig_custom-toast').showToast('', '"회원가입 약관"에 동의 해주셔야 가입이 가능 합니다.', 'error');
        else if(!this.isValidEmail) this.template.querySelector('c-ig_custom-toast').showToast('', '잘못된 이메일 입니다.<br> 다시 입력해 주세요.', 'error');
        /* else if(!this.isPasswordReg) this.template.querySelector('c-ig_custom-toast').showToast('', '잘못된 비밀번호 입니다.<br> 다시 입력해 주세요.', 'error');
        else if(!this.isValidatePwd) this.template.querySelector('c-ig_custom-toast').showToast('', '"비밀번호 확인"을 검사해 주세요.', 'error'); */
        else if(!this.isValidEmail) this.template.querySelector('c-ig_custom-toast').showToast('', '잘못된 이메일 입니다.<br> 다시 입력해 주세요.', 'error');
        else if(!this.isValidNickNameCheck) this.template.querySelector('c-ig_custom-toast').showToast('', '닉네임 중복검사를 다시 해주세요.', 'error');
        else if(!this.isValidUserName) this.template.querySelector('c-ig_custom-toast').showToast('', '사용자님의 이름을 다시 한번 확인해 주세요.', 'error');
        else if(!this.userBirth) this.template.querySelector('c-ig_custom-toast').showToast('', '사용자님의 "생년월일"을 입력 해주세요.', 'error');
        else if(!this.isValidPhone) this.template.querySelector('c-ig_custom-toast').showToast('', '휴대폰 번호를 다시 확인해 주세요.', 'error');
        else if(!this.isValidConfirm) this.template.querySelector('c-ig_custom-toast').showToast('', '휴대폰 인증 확인이 필요합니다.', 'error');
        else {
            let dataGroup = {email: this.userEmail, /* password: this.userPassword, */ nickName: this.userNickName, name: this.userName, birth: this.userBirth, phone: this.userPhone};
            console.log(JSON.stringify(dataGroup));
            signUp({dataGroup: dataGroup})
            .then(result => {
                console.log('result => ', result);
                if(result == 'overlap') this.template.querySelector('c-ig_custom-toast').showToast('', '이미 가입된 회원 입니다.', 'error');
                else if(result == 'error') this.template.querySelector('c-ig_custom-toast').showToast('', '회원가입 실패. <br> 관리자에게 문의 해주세요.', 'error');
                else if(result == 'success') {
                    this.template.querySelector('c-ig_custom-toast').showToast('', '회원가입 성공.<br> 사용자님의 이메일로 비밀번호 설정 메세지를 보냈습니다.<br>확인 후 비밀번호를 설정해 주세요.', 'success');
                    setTimeout(() => this.cancleLink(), 3000);
                }
            })
            .catch(error => {
                console.log('error => ', error);
                this.template.querySelector('c-ig_custom-toast').showToast('', '회원가입 실패. <br> 다시 시도하거나 관리자에게 문의 해주세요.', 'error');
            })
        }
    }
    
    cancleLink() {
        this[NavigationMixin.Navigate]({
            type: "comm__namedPage",
            attributes: {
                name: "Login"
            }
        })
    }
};