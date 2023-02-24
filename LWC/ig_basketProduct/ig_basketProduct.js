import { LightningElement, track } from 'lwc';
import { updateDataConnector } from 'lightning/analyticsWaveApi';
import { loadScript } from 'lightning/platformResourceLoader';
import getBasketList from '@salesforce/apex/IG_MyPageController.getBasketList';
import getImageList from '@salesforce/apex/Ig_searchContents.getImageList';
import getProductList from '@salesforce/apex/IG_MyPageController.getProductList';
import iamport_payment from '@salesforce/resourceUrl/iamport_payment';
import JS_jquery from '@salesforce/resourceUrl/JS_jquery';
import deleteBasket from '@salesforce/apex/IG_MyPageController.deleteBasket';
import deleteBasketAll from '@salesforce/apex/IG_MyPageController.deleteBasketAll';
import getUser from '@salesforce/apex/IG_PaymentController.getUser';
import createPayment from '@salesforce/apex/IG_PaymentController.createPayment';

export default class Ig_basketProduct extends LightningElement {

    path = '마이페이지 > 장바구니';

    /** iterator 변수 */
    @track item = [];

    recordId;
    img;

    /** 모달창 if:true 변수 */
    isShowModal;

    /** 상품 브랜드 변수 */
    brand;
    /** 상품 이름 변수 */
    productName;
    /** 상품 수량 */
    productNum;
    /** 상품 가격 */
    productPrice = 0;
    /** 상품 총 가격 */
    purchasePrice = 0;
    /** 총 수량 */
    totalCount = 0;
    /** 총 가격 */
    totalPrice = 0;

    /** iterator 가격 변수 */
    price = [];

    connectedCallback(){
        this.getList();
        getUser().then(res => {
            this.user = res;
            console.log('this.user :: ',this.user);
        });
    }

    renderedCallback() {
        console.log('render');
        try {
            console.log('totalPrice :: ',this.totalPrice);
            // this.totalPrice = this.totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            this.productPrice = this.productPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            this.purchasePrice = this.purchasePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } catch(err) {
            console.log('err :: ',JSON.stringify(err));
        }
    }

    /** 레코드 별로 결제 전 팝업 띄우는 함수 */
    onBuy(e) {
        this.recordId = e.target.dataset.id;
        this.productNum = e.target.dataset.num;
        getProductList({recordId : this.recordId}).then(res => {
            getImageList({recordId : this.recordId}).then(img => {
                this.img = img[0].ContentDownloadUrl;
                this.brand = res[0].brand__c;
                this.productName = res[0].keyboardName__c;
                this.purchasePrice = Number(this.productNum * res[0].productPrice__c).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                this.productPrice = res[0].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                this.isShowModal = true;
            });
        }).catch(err => {
            console.log('err :: ',err);
        })
    }

    /** 팝업 창에서 결제 진행 함수 */
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
                    amount : '100',
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
        });
    }

    /** 개별 레코드 삭제 함수 */
    onDelete(e) {
        this.recordId = e.target.dataset.id;
        deleteBasket({recordId : this.recordId})
        .then(res => {
            console.log('res :: ',res);
            if(res == 'success') this.template.querySelector('c-ig_custom-toast').showToast('', '삭제 완료하였습니다,,', 'success');
            else this.template.querySelector('c-ig_custom-toast').showToast('', '삭제에 실패하였습니다,,', 'warning');
        });
        this.getList();
    }

    /** 전체 구매 함수 */
    onBuyAll() {

    }

    /** 레코드 전체 삭제 함수 */
    onDeleteAll() {
        deleteBasketAll().then(res => {
            console.log('res :: ',res);
            if(res == 'success') this.template.querySelector('c-ig_custom-toast').showToast('', '삭제 완료하였습니다,,', 'success');
            else this.template.querySelector('c-ig_custom-toast').showToast('', '삭제에 실패하였습니다,,', 'warning');
        });
        this.getList();
    }

    /** 장바구니 리스트 가져오는 함수 */
    getList() {
        getBasketList().then(async res => {
            console.log('res :: ',res);
            for(let i = 0; i < res.length; i++){
                this.recordId = res[i].product__c;
                await getImageList({recordId : this.recordId}).then(result => {
                    console.log('imgRes :: ',result);
                    this.item.push({
                        id : res[i].product__c,
                        img : result[0].ContentDownloadUrl,
                        productName : res[i].product__r.keyboardName__c,
                        productNum : res[i].productNum__c,
                        productPrice : res[i].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                        brand : res[i].product__r.brand__c
                    });
                    console.log('type :: ', typeof res[i].productPrice__c);
                    this.price.push({
                        productName : res[i].product__r.keyboardName__c,
                        price : res[i].productPrice__c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    });
                    this.sumCount += Number(res[i].productNum__c);
                    this.totalPrice += Number(res[i].productPrice__c);
                    console.log('this.price :: ',JSON.stringify(this.price));
                    console.log('this.sumCount :: ',this.sumCount);
                    console.log('this.totalPrice :: ',this.totalPrice);
                    console.log('item :: ',JSON.stringify(this.item));
                }).catch(err => {
                    console.log('imgErr :: ',err);
                });
            }
            this.totalPrice = this.totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }).catch(err => {
            console.log('err :: ',err);
        });
    }

    /** 팝업 창 닫기 버튼 */
    closeModal() {
        this.isShowModal = false;
    }
}