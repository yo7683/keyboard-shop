import { LightningElement } from 'lwc';

// static resource
import bannerImg from '@salesforce/resourceUrl/shopImg';
import logo from '@salesforce/resourceUrl/Keyboard_Logo';

export default class Ig_homeBanner extends LightningElement {
    
    currentIndex = 1;
    img = bannerImg; //  + '/banner';
    logo = logo;
    bannerImg = [];
    bannerSize = 5;
    btnCnt = [];
    isFirLoop = true;
    bannerTime = 3000;
    callLoopId;


    connectedCallback() {
        setTimeout(() => this.handleContainerStyle(), 0);
        this.calcTagSize();
        setTimeout(() => this.loopSlideBanner(), this.bannerTime);
    }

    // Container style 주는 함수
    handleContainerStyle() {
        let container = this.template.querySelector('.container');
        container.style.width = this.bannerSize * 100 + 'vw';
        this.template.querySelector('.btn-group button').style.backgroundColor = 'rgb(78, 78, 78)';             
    }

    // bannerImageSize에 따라 itorator반복 횟수 제어
    calcTagSize() {
        for(let i = 1; i < 3; i++) {
            this.bannerImg.push(this.img + '/banner' + i + '.jpg');
            this.btnCnt.push('btn-' + i);
        }        
        for(let i = 3; i < 5; i++) {
            this.bannerImg.push(this.img + '/banner' + i + '.png');
            this.btnCnt.push('btn-' + i);
        }
        this.bannerImg.push(this.img + '/banner5' + '.jpg');
        this.btnCnt.push('btn-' + 5);
    }

    // 사용자가 베너 하단 버튼 클릭시 해당 베너로 넘어가도록 해주는 함수
    handleBannerBtn(e) {
        clearTimeout(this.callLoopId);
        var ele = this.template.querySelector('.' + e.target.className);
        let btnEle = ele.className.split('-');
        let moveSlide = (btnEle[1] - 1) * 100;
        this.template.querySelector('.container').style.transform = 'translate(-'+ moveSlide +'vw)';
        this.currentIndex = btnEle[1];
        this.handleBannerBtnColor();
        this.callLoop();
    }
    
    // 일정 시간마다 베너가 자동적으로 slide되도록 하기위한 sub함수
    callLoop() {
        this.callLoopId = setTimeout(() => this.loopSlideBanner(), this.bannerTime);
    }

    // 배너가 일정 시간마다 자동적으로 slide 되도록 하기위한 main 함수
    loopSlideBanner() {
        let moveSlide = 0;
        if(this.currentIndex != this.bannerSize) {
            moveSlide = (this.currentIndex) * 100;
            this.currentIndex = Number(this.currentIndex) + 1;
        } else this.currentIndex = 1;
        this.template.querySelector('.container').style.transform = 'translate(-'+ moveSlide +'vw)';
        this.callLoop();
        this.handleBannerBtnColor();
    }

    // 현재 사용자가 보고있는 베너의 버튼 색 제어 ( 그외 버튼은 white )
    handleBannerBtnColor() {
        let btns = this.template.querySelectorAll('.btn-group button');
        btns.forEach(ele => {
            if(ele.className == 'btn-' + this.currentIndex) ele.style.backgroundColor = 'rgb(78, 78, 78)';
            else ele.style.backgroundColor = 'white';
        });
    }
}