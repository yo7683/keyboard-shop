import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import getProductList from '@salesforce/apex/Ig_searchContents.getProductList';
import getImageList from '@salesforce/apex/Ig_searchContents.getImageList'
import getReview from '@salesforce/apex/Ig_searchContents.getReview';
import getGrade from '@salesforce/apex/Ig_searchContents.getGrade';

export default class Ig_homeContents extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference)
    pageRef;

    brand = '선택 안함';
    keyboardType = '선택 안함';
    filter = '기본 순';
    searchValue;
    searchInfo;
    @track searchImg = [];
    renderClick = false;
    
    @track item = [];
    @track pageArea = [];
    @track pageNum = 0;
    @track allList = 0;
    @track pageNumList = [];
    @api recordId;

    pageListNumLength;
    pageAreaNum;

    grade;
    gradeList;
    gradeSum = 0;
    review;

    start = '<<';
    prev = '<';

    get brandOptions() {
        return [
            { label: '선택 안함', value: '선택 안함' },
            { label: '한성', value: '한성' },
            { label: '로지텍', value: '로지텍' },
            { label: '몰라', value: '몰라' },
        ];
    }

    get keyboardTypeOptions() {
        return [
            { label: '선택 안함', value: '선택 안함' },
            { label: '청축', value: '청축' },
            { label: '갈축', value: '갈축' },
            { label: '적축', value: '적축' },
            { label: '흑축', value: '흑축' },
        ];
    }
    get filterOptions() {
        return [
            {label : '기본 순', value : '기본 순'},
            {label : '가격 높은 순', value : '가격 높은 순'},
            {label : '가격 낮은 순', value : '가격 낮은 순'},
        ]
    }

    connectedCallback() {
        this.pageNum = this.pageRef.state.pageNum?this.pageRef.state.pageNum:1;
        this.pageAreaNum = this.pageRef.state.pageAreaNum?Number(this.pageRef.state.pageAreaNum):0;
        this.getList();
        // setTimeout(() => {
        //     let fBtn =this.template.querySelector('.pageNumBtn');
        //     fBtn.className = 'btnClick';
        // }, 1000);
    }
    
    brandChange(e) {
        this.brand = e.target.value;
    }

    keyboardTypeChange(e) {
        this.keyboardType = e.target.value;
    }

    filterChange(e) {
        this.filter = e.target.value;
        console.log('this.filter :: ',this.filter);
        this.getList();
    }

    onSearch(e) {
        // const enterKey = e.keyCode === 13;
        // this.searchValue = e.target.value;
        // console.log('searchValue :: ',this.searchValue);
        // if(enterKey) {
        //     if (this.searchValue != '') {
        //         this.getList();
        //     } else {
        //         this.searchInfo = '검색 결과 없다야~~';
        //     }
        // }
        this.searchValue = e.target.value;
        this.pageNum = 1;
        this.pageAreaNum = 0;
        this.getList();
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            },
            state: {
                pageNum: this.pageNum,
                pageAreaNum: this.pageAreaNum
            }
        });
    }

    getList() {
        getProductList({num : this.pageNum, searchValue : this.searchValue, filter : this.filter, brand : this.brand, keyboardType : this.keyboardType})
        .then(async res => {
            console.log('res.allList :: ',res.allList);
            console.log('res.returnList :: ',res.returnList);
            if (res.allList > 0) {
                console.log('gogo');
                this.item = [];
                this.pageArea = [];
                let tempList = res.returnList;
                this.allList = res.allList;
                for(let i = 0; i < tempList.length; i++) {
                    this.recordId = tempList[i].Id;
                    await getGrade({recordId : this.recordId})
                    .then(r => {
                        this.review = r.allGrade;
                        this.grade = r.grade;
                        console.log('this.review :: ',this.review);
                        console.log('grade :: ',this.grade);
                        // this.gradeList = r.gradeList;
                        // console.log('gradeList :: ',this.gradeList);
                        // console.log('gradeList.length :: ',this.gradeList.length);
                        // console.log('review :: ',this.review);
                        // this.gradeSum = 0;
                        // if(this.gradeList.length > 0) {
                        //     console.log('grade__c :: ',this.gradeList[i].grade__c);
                        //     for(let i = 0; i < this.gradeList.length; i++) {
                        //         this.gradeSum += Number(this.gradeList[i].grade__c);
                        //         console.log('Sum :: ',this.gradeSum);
                        //     }
                        //     this.grade = this.gradeSum / this.gradeList.length;
                        //     grade = this.grade.toFixed(1);
                        //     console.log('grade :: ',grade);
                        // }
                        // else {
                        //     gr00ade = 0;
                        // }
                    }).catch(err => {
                        console.log('err :: =>  ', JSON.stringify(err));
                    })
                    await getImageList({recordId : this.recordId})
                    .then(result => {
                        if(result != ''){
                            console.log('true');
                            console.log('result :: ',result);
                            this.item.push({id : tempList[i].Id,
                                            brand : tempList[i].brand__c,
                                            name : tempList[i].Name,
                                            keyboardType : tempList[i].keyboardType__c,
                                            keyboardName : tempList[i].keyboardName__c, 
                                            productPrice : tempList[i].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                            productInfo : tempList[i].productInfo__c,
                                            img : result[0].ContentDownloadUrl,
                                            grade : this.grade,
                                            review : this.review
                                        });
                        }
                        else {
                            console.log('false');
                            this.item.push({id : tempList[i].Id,
                                brand : tempList[i].brand__c,
                                name : tempList[i].Name,
                                keyboardType : tempList[i].keyboardType__c,
                                keyboardName : tempList[i].keyboardName__c, 
                                productPrice : tempList[i].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                productInfo : tempList[i].productInfo__c,
                                grade : this.grade,
                                review : this.review
                            });
                        }
                    }).catch(err => {
                        console.log('imgErr :: ',err);
                    });
                }
                this.pageListNumLength = Math.ceil(this.allList / 10);
                let pageTempList = [];
                for(let i = 1; i < this.pageListNumLength+1; i++) {
                    pageTempList.push(i);
                    if (i % 5 === 0) {
                        this.pageArea.push(pageTempList);
                        pageTempList = [];
                    }
                    else if (i === this.pageListNumLength) {
                        this.pageArea.push(pageTempList);
                        pageTempList = [];
                    }
                }
                this.pageNumList = this.pageArea[this.pageAreaNum];
                console.log('this.pageNumList :: ',JSON.stringify(this.pageNumList));
            } else {
                this.item = [];
                this.pageArea = [];
                this.allList = 0 ;
                this.pageNumList = [];
            }
        }).catch(err => {
            console.log('listErr :: ',err);
        });
        // let pageBtn = this.template.querySelectorAll('.pageNumBtn > button');
        // pageBtn.forEach(el => {
        //     el.className = '';
        // })
    }

    onPaging(e) {
        // if(this.renderClick) {
        //     let changeBtn = this.template.querySelector('.btnClick');
        //     changeBtn.className = 'pageNumBtn';
        // }
        // let targetBtn = e.currentTarget;
        // targetBtn.className = 'btnClick';
        // this.renderClick = true;
        this.pageNum = e.target.value;
        this.getList();
        // this[NavigationMixin.Navigate]({
        //     type: 'comm__namedPage',
        //     attributes: {
        //         name: 'Home'
        //     },
        //     state: {
        //         pageNum: this.pageNum,
        //         pageAreaNum: this.pageAreaNum
        //     }
        // });
    }

    onArrowClick(e) {
        switch(e.target.value) {
            case "start":
                if (this.pageAreaNum !== 0) {
                    this.pageNum = 1;
                    this.pageAreaNum--;
                    this.getList();
                    this.getReviewList();
                }
                break;
            case "prev":
                if (this.pageNum % 5 == 1 && this.pageAreaNum !== 0) {
                    this.pageAreaNum--;
                    this.pageNum = 1 + (this.pageAreaNum * 5);
                    this.getList();
                    this.getReviewList();
                } else if(this.pageNum % 5 !== 1) {
                    this.pageNum--;
                    this.getList();
                    this.getReviewList();
                }
                break;
            case "next":
                if(this.pageNum % 5 == 0 && this.pageAreaNum !== this.pageArea.length - 1) {
                    this.pageAreaNum++;
                    this.pageNum = 1 + (this.pageAreaNum * 5);
                    this.getList();
                    this.getReviewList();
                } else if(this.pageNum % 5 !== 0 && this.pageNum !== this.pageListNumLength){
                    this.pageNum++;
                    this.getList();
                    this.getReviewList();
                }
                break;
            case "end":
                if (this.pageAreaNum !== this.pageArea.length - 1) {
                    this.pageAreaNum++;
                    this.pageNum = (1+(5*this.pageAreaNum));
                    this.pageNumList = this.pageArea[this.pageAreaNum];
                    this.getList();
                    this.getReviewList();
                }
                break;
            default: alert("error");
        }
    }

    onDetailPage(e) {
        this.recordId = e.target.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'productDetail__c'
            },
            state: {
                recordId : this.recordId,
                pageNum: this.pageNum
            }
        });
    }
}