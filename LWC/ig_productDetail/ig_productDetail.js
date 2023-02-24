import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { loadScript } from 'lightning/platformResourceLoader';
import getProduct from '@salesforce/apex/Ig_searchContents.getProduct';
import getImageList from '@salesforce/apex/Ig_searchContents.getImageList';
import insertReview from '@salesforce/apex/Ig_searchContents.insertReview';
import getReview from '@salesforce/apex/Ig_searchContents.getReview';
import insertProduct from '@salesforce/apex/IG_PaymentController.insertProduct';
import merchantCode from '@salesforce/label/c.merchantCode';
import iamport_payment from '@salesforce/resourceUrl/iamport_payment';
import JS_jquery from '@salesforce/resourceUrl/JS_jquery';
import insertBasket from '@salesforce/apex/IG_PaymentController.insertBasket';
import getUser from '@salesforce/apex/IG_PaymentController.getUser';
import createPayment from '@salesforce/apex/IG_PaymentController.createPayment';

export default class Ig_productDetail extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference)
    pageRef;
    recordId;
    productName;
    brand;
    productPrice;
    productId;
    img;
    star;
    filter = '최신 순';

    @track itemList;
    @track item = [];
    @track pageArea = [];
    @track pageNum = 0;
    @track allList = 0;
    @track pageNumList = [];

    pageListNumLength;
    pageAreaNum;

    /** 총 가격 */
    purchasePrice = 0;
    /** 상품 가격 */
    price;
    /** 구매할 상품 수량 */
    count = 1;
    /** 상품 재고 수 */
    productQuantity;

    /** 주문번호 */
    orderNum;

    /** 유저 정보 */
    user = [];

    start = '<<';
    prev = '<';

    /** 모달 창 if:ture 변수 */
    isShowModal;

    label = {
        merchantCode
    }

    /** 리뷰 필터 옵션 */
    get filterOptions() {
        return [
            {label : '최신 순', value : '최신 순'},
            {label : '오래된 순', value : '오래된 순'},
            {label : '평점 높은 순', value : '평점 높은 순'},
            {label : '평점 낮은 순', value : '평점 낮은 순'},
        ]
    }

    connectedCallback() {
        this.recordId = this.pageRef.state.recordId;
        this.pageNum = this.pageRef.state.pageNum?this.pageRef.state.pageNum:1;
        this.pageAreaNum = this.pageRef.state.pageAreaNum?Number(this.pageRef.state.pageAreaNum):0;
        this.getList();
        this.getReviewList();
        getUser().then(res => {
            this.user = res;
            console.log('this.user :: ',this.user);
        });
    }

    /** 가격에 쉼표 정규식 넣기 */
    renderedCallback() {
        console.log('reder');
        this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /** 상품 수량 + 버튼 함수 */
    countPlus() {
        console.log('productQuantity :: ',this.productQuantity);
        if(this.count < this.productQuantity) {
            this.count++;
            this.purchasePrice = this.price * this.count;
            console.log('purchasePrice :: ',this.purchasePrice);
            // this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else {
            this.template.querySelector('c-ig_custom-toast').showToast('', '상품 수량이 부족합니다,,', 'warning');
        }
    }

    /** 상품 수량 - 버튼 함수 */
    countMinus() {
        if(this.count > 1) {
            this.count--;
            this.purchasePrice = this.price * this.count;
            console.log('purchasePrice :: ',this.purchasePrice);
            // this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }

    /** 상품 수량 직접 입력 함수 */
    countChange(e) {
        console.log('value :: ',e.target.value);
        console.log(typeof e.target.value);
        if(e.target.value <= this.productQuantity) {
            if(e.target.value > -1){
                this.count = e.target.value;
                this.purchasePrice = this.price * this.count;
                // this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                this.count = 1;
                this.purchasePrice = this.price * this.count;
                // this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        } else {
            this.template.querySelector('c-ig_custom-toast').showToast('', '상품 수량이 부족합니다,,', 'warning');
            this.count = this.productQuantity;
            this.purchasePrice = this.price * this.count;
            // this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }

    /** 결제 전 모달 창 뛰우는 함수 */
    onBuy() {
        this.isShowModal = true
        // if(this.count > 0) {
        //     this.purchasePrice = Number(this.purchasePrice.replace(/,/gi, '')).toString();
        //     insertProduct({productId : this.productId, purchasePrice : this.purchasePrice, count : this.count}).then(res => {
        //         console.log('res :: ',res);
        //         this.template.querySelector('c-ig_custom-toast').showToast('', '구매 성공', 'success');
        //     }).catch(err => {
        //         console.log('err :: ',err);
        //         this.template.querySelector('c-ig_custom-toast').showToast('', '구매 실패', 'warning');
        //     });
        // } else this.template.querySelector('c-ig_custom-toast').showToast('', '1개 이상의 수량을 기입해주세요.', 'warning');
        // this.purchasePrice = this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /** 장바구니로 담는 함수 */
    onBasket() {
        this.purchasePrice = Number(this.purchasePrice.replace(/,/gi, ''));
        insertBasket({productName : this.productName, recordId : this.recordId, count : this.count, purchasePrice : this.purchasePrice})
        .then(res => {
            console.log('res :: ',res);
            this.template.querySelector('c-ig_custom-toast').showToast('', '장바구니에 담았습니다.', 'success');
        }).catch(err => {
            console.log('err :: ',err);
            this.template.querySelector('c-ig_custom-toast').showToast('', '오류가 발생하였습니다 관리자에게 문의해주세요.', 'warning');
        });
        this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /** 모달 창에서 결제 진행하는 함수 */
    async onPay() {
        await createPayment().then(res => {
            console.log('res :: ',res);
            this.orderNum = res;
        });
        this.isShowModal = false;
        Promise.all([
            loadScript(this, iamport_payment),
            loadScript(this, JS_jquery)
        ]).then(res => {
            var IMP = window.IMP;
            IMP.init('imp74348251'); // imp74293802 => 일규 service key
                                     // imp74348251 => 태희 service key
            this.purchasePrice = Number(this.purchasePrice.replace(/,/gi, ''));
            // getUser().then(user => {
                // console.log('user :: ',user);
                console.log('orderNum :: ',this.orderNum);
                console.log('price :: ',this.purchasePrice);
                console.log('productName :: ',this.productName);
                IMP.request_pay({
                    pg : 'html5_inicis',
                    merchant_uid: this.orderNum, // 상점에서 관리하는 주문 번호를 전달
                    name : this.productName,
                    amount : this.purchasePrice,
                    buyer_email : this.user[0].Username/* user[0].Username */,
                    buyer_name : this.user[0].LastName/* user[0].LastName */,
                    buyer_tel : this.user[0].Phone/* user[0].Phone */                
            // }).catch(err => {
            //     console.log('err1 :: ',JSON.stringfy(err));
            // })
        }, rsp => {
            console.log('result :: ',JSON.stringify(rsp));
            console.log('purchasePrice :: ',this.purchasePrice);
            if(rsp.success) {
                console.log('success');
                this.purchasePrice = Number(this.purchasePrice.replace(/,/gi, ''));
                insertProduct({productId : this.productId, purchasePrice : this.purchasePrice, count : this.count})
                .then(res => {
                    console.log('insertProduct :: ',res);
                    this.template.querySelector('c-ig_custom-toast').showToast('', '결제가 완료되었습니다.', 'success');

                }).catch(err => {
                    console.log('insert err :: ',err);
                })
            } else {
                console.log('else');
                console.log('error_msg :: ',rsp.error_msg);
                this.template.querySelector('c-ig_custom-toast').showToast('', rsp.error_msg, 'warning');
            }
            console.log('2');
        });
           /*  var IMP = window.IMP;
            console.log('4');
            console.log('IMP =>>  ', JSON.stringify(IMP));
            IMP.init('imp74348251');
            IMP.request_pay({
                pg : 'html5_inicis',
                // pay_method : 'kakaopay',
                merchant_uid: "order_no_0002", // 상점에서 관리하는 주문 번호를 전달
                name : '결제테스트',
                amount : '100',
                buyer_email : 'yo7683@naver.com',
                buyer_name : 'TEST',
                buyer_tel : '010-3571-7683'
            }, function(rsp) {
                console.log('5');
                console.log(JSON.stringify(rsp));
            }) */
            /* console.log('res :: ',JSON.stringify(window.IMP));
            var IMP = window.IMP;
            IMP.init = this.label.merchantCode;
            // IMP.init(this.label.merchantCode);
            // IMP.init("imp74348251");
            console.log('4');
            IMP.request_pay({ // param
                // init : this.label.merchantCode,
                pg : 'html5_inicis',
                pay_method : 'kakaopay',
                merchant_uid: "order_no_0001", // 상점에서 관리하는 주문 번호를 전달
                name : '주문명:결제테스트',
                amount : 14000,
                buyer_email : 'yo7683@naver.com',
                buyer_name : 'TEST',
                buyer_tel : '010-3571-7683',
                buyer_addr : '서울특별시 강남구 삼성동',
                buyer_postcode : '12273',
                // m_redirect_url : 'https://spcompany4-dev-ed.my.site.com/keyboard/s/productDetail' // 예: https://www.my-service.com/payments/complete/mobile
            }.catch(err => {
                console.log('err1 :: ',err);
            }),
            // this.Function1(rsp); 
            // function (rsp) {// callback
            rsp => {
                console.log('5');
                if (rsp.success) {
                    console.log('6');
                    jquery.ajax({
                        url: "https://spcompany4-dev-ed.my.site.com/keyboard/s/productDetail", // 예: https://www.myservice.com/payments/complete
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        data: {
                            imp_uid: rsp.imp_uid,
                            merchant_uid: rsp.merchant_uid
                        }
                    }).done(function (data) {
                        console.log('7');
                        // 가맹점 서버 결제 API 성공시 로직
                        })
                } else {
                    console.log('8');
                    // 결제 실패 시 로직,
                }
            }); */
        });
    }

    /** 리뷰 필터 선택 시 onChanege 함수 */
    filterChange(e) {
        this.filter = e.target.value;
        console.log('this.filter :: ',this.filter);
        this.pageNum = 1;
        this.getList();
        this.getReviewList();
    }

    /** 리뷰 제출 함수 */
    onSubmit() {
        let review = this.template.querySelector('.review').value;
        let stars = this.template.querySelectorAll('.stars');
        stars.forEach(el => {
            if(el.checked) this.star = el.value;
        });
        console.log('star :: ',this.star);
        if(review){
            insertReview({recordId : this.recordId, review : review, grade : this.star}).then(res => {
                console.log('res :: ',res);
                this.template.querySelector('.review').value = '';
                this.getReviewList();
            }).catch(err => {
                console.log('err :: ',err);
            });
        } else {
            this.template.querySelector('c-ig_custom-toast').showToast('', '내용을 입력해주세요~', 'warning');
        }
    }

    /** 상품 정보 리스트 가져오는 함수 */
    getList() {
        getProduct({recordId : this.recordId}).then(res => {
            console.log('res :: ',res);
            this.productName = res[0].Name;
            this.brand = res[0].brand__c;
            this.productPrice = res[0].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            this.productId = res[0].Id;
            this.purchasePrice = res[0].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            this.price = res[0].productPrice__c;
            this.productQuantity = res[0].productNum__c;
            getImageList({recordId : this.recordId}).then(result => {
                this.img = result[0].ContentDownloadUrl;
            });
        }).catch(err => {
            console.log('imgErr :: ',err);
        });
    }

    /** 리뷰 리스트 가져오는 함수 */
    getReviewList() {
        console.log('this.pageNum :: ',this.pageNum);
        console.log('pageAreaNum :: ',this.pageAreaNum);
        getReview({num : this.pageNum, recordId : this.recordId, filter : this.filter}).then(res => {
            console.log('res.allList :: ',res.allList);
            console.log('res.returnList :: ',res.returnList);
            if(res.allList) {
                console.log('inside');
                this.item = [];
                this.pageArea = [];
                let tempList = res.returnList;
                this.allList = res.allList;
                for(let i = 0; i < tempList.length; i++) {
                    this.item.push({review : tempList[i].content__c,
                                    grade : tempList[i].grade__c});
                }
                this.pageListNumLength = Math.ceil(this.allList / 10);
                let pageTempList = [];
                for(let i = 1; i < this.pageListNumLength + 1; i++) {
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
            } else {
                console.log('else');
                this.item = [];
                this.pageArea = [];
                this.pageNumList = [];
            }
        }).catch(err => {
            console.log('err :: ',err);
        });
    }

    /** < > 화살표 페이징 함수 */
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
                // if(this.pageAreaNum == this.pageArea.length-1) {
                //     this.pageNum = 1 + (this.pageAreaNum * 5);
                //     this.getList();
                //     this.getReviewList();
                // } else {
                //     this.pageNum = 1 + (this.pageAreaNum * 5);
                //     this.pageAreaNum++;
                //     this.getList();
                //     this.getReviewList();
                // }
                // if (this.pageAreaNum !== this.pageArea.length-1) {
                //     this.pageAreaNum = this.pageArea.length-1;
                //     let secondArrayLength = this.pageArea[this.pageAreaNum].length-1;
                //     this.pageNum = this.pageArea[this.pageAreaNum][secondArrayLength];
                //     this.pageNumList = this.pageArea[this.pageAreaNum];
                //     this.getList();
                //     this.getReviewList();
                // }
                break;
            default: alert("error");
        }
    }

    /** 페이징 함수 */
    onPaging(e) {
        this.pageNum = e.target.value;
        this.getList();
        this.getReviewList();
    }

    /** 모달 창 닫기 함수 */
    closeModal() {
        this.isShowModal = false;
    }
}