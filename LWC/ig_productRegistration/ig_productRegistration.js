import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import submitProduct from '@salesforce/apex/Ig_submitProduct.submitProduct'
import uploadFile from '@salesforce/apex/Ig_fileUploadController.uploadFile'

export default class Ig_productRegistration extends LightningElement {

    head = [];

    productInfo = ['브랜드', '키보드 타입', '상품 이름', '키보드 이름', '상품 수량', '상품 가격'];

    keyIndex = 1;

    @track item = []; // value들을 담아줄 iterator 변수
  
    brand;        //
    keyboardType; //
    productName;  //
    keyboardName; // item에 들어갈 변수
    productNum;   //
    productPrice; // 
    file;         //
    
    @api recordId;

    fileData;
    fileAcceptType = ['.pdf', '.jpg', '.jpeg', '.png']; // 파일 형식
    fileload;
    fileList = [];
    fileIdx;      // 파일을 지울 때 클릭한 행의 파일을 지우기 위한 file index 변수

    TF = false;

    // 시작할 때 컬럼과 행 한개를 띄워줌
    connectedCallback() {
        for(let i = 0; i < this.productInfo.length; i++) {
            this.head.push({productInfo : this.productInfo[i]});
        }
        this.item.push({index : this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
        console.log('item :: ',JSON.stringify(this.item));
    }

    // brand combobox에 들어갈 label 과 value
    get brandOptions() {
        return [
            { label: '한성', value: '한성' },
            { label: '로지텍', value: '로지텍' },
            { label: '몰라', value: '몰라' },
        ];
    }

    // brand onchange
    brandChange(e) {
        this.brand = e.target.value;
        this.item[e.target.dataset.id-1].brand = this.brand;
    }

    // brand combobox에 들어갈 label 과 value
    get keyboardOptions() {
        return [
            { label: '청축', value: '청축' },
            { label: '갈축', value: '갈축' },
            { label: '적축', value: '적축' },
            { label: '흑축', value: '흑축' },
        ];
    }

    // keyboardType onchange
    keyboardChange(e) {
        this.keyboardType = e.target.value;
        this.item[e.target.dataset.id-1].keyboardType = this.keyboardType;
        console.log(JSON.stringify(this.item));
    }

    // productName onchange
    productNameChange(e) {
        this.productName = e.target.value;
        this.item[e.target.dataset.id-1].productName = this.productName;
        console.log(JSON.stringify(this.item));
    }

    // keyboardName onchange
    keyboardNameChange(e) {
        this.keyboardName = e.target.value;
        this.item[e.target.dataset.id-1].keyboardName = this.keyboardName;
    }

    // productNum onchange
    productNumChange(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
        this.productNum = e.target.value;
        this.item[e.target.dataset.id-1].productNum = this.productNum;
        console.log('proNum :: ',this.productNum);
    }

    // productPrice onchange
    productPriceChange(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
        this.productPrice = e.target.value;
        this.item[e.target.dataset.id-1].productPrice = this.productPrice;
    }
    
    // 1개 행 추가 버튼
    addRow() {
        console.log('inside addRow');
        console.log('item :: ',JSON.stringify(this.item));
        this.item.push({index : ++this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
        console.log('keyIndex :: ',this.keyIndex);
        console.log('item[] :: ', JSON.stringify(this.item));
        this.TF = true;
    }

    // 5개 행 추가 버튼
    add5Row() {
        for(let i = 0; i < 5; i++) {
            this.item.push({index : ++this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
        }
        this.TF = true;
    }

    // 1개 행 복사 버튼
    copyRow() {
        this.item.push({
            index : ++this.keyIndex,
            file: '',
            brand : this.brand, 
            keyboardType : this.keyboardType, 
            productName : this.productName, 
            keyboardName : this.keyboardName, 
            productNum : this.productNum,
            productPrice : this.productPrice});
        this.TF = true;
    }

    // 5개 행 복사 버튼
    copy5Row() {
        for(let i = 0; i < 5; i++) {
            this.item.push({index : ++this.keyIndex, 
                brand : this.brand,
                file: '',
                keyboardType : this.keyboardType, 
                productName : this.productName, 
                keyboardName : this.keyboardName, 
                productNum : this.productNum,
                productPrice : this.productPrice});
        }
        this.TF = true;
    }

    // 1개 행 삭제 버튼(휴지통 버튼)
    deleteRow(e) {
        if(this.item.length < 2) {
            this.item = [];
            this.item.push({index : this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
            this.fileList = [];
        } else {
            let target = e.target.dataset.id;
            console.log('target :: ',target);
            this.item = this.item.filter((element) => element.index != target);
            console.log('item :: ', JSON.stringify(this.item));
            for(let i = 0; this.item.length; i++) {
                this.item[i].index = i + 1;
                this.keyIndex = this.item[i].index;
                for(let i = 0; i < this.fileList.length; i++) {
                    console.log('1');
                    console.log('e.target.dataset.id :: ',target);
                    if(this.fileList[i].index == target) {
                        console.log('2');
                        this.fileList[i] = [{'index' : this.fileIdx, 'filename' : '', 'base64' : '', 'recordId' : ''}];
                        this.fileList[i].index = this.item[e.target.dataset.id-1].index;
                        console.log('3');
                    }
                }
            }
        }
    }

    // 전체 행 삭제 버튼
    deleteAll() {
        this.item = [];
        this.keyIndex = 1;
        this.item.push({index : this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
        this.fileList = [];
        // if(this.item.length < 2) {
        //     this.item.pop({index : this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
        //     this.item.push({index : this.keyIndex, file: '', brand : '', keyboardType : '', productName : '', keyboardName : '', productNum : '', productPrice : ''});
        //     this.fileList = [];
        //     const event = new ShowToastEvent({
        //         title: '호호',
        //         message:
        //             '1개일 때는 안되지롱~~',
        //     });
        //     this.dispatchEvent(event);
        // } else {
        //     this.item = this.item.filter((element) => element.index == 1);
        //     for(let i = 0; this.item.length; i++) {
        //         this.item[i].index = i + 1;
        //         this.keyIndex = this.item[i].index;
        //     }
        //     this.fileList = this.fileList.filter((element) => element.index == 1);
        //     for(let i = 0; this.fileList.length; i++) {
        //         this.fileList[i].index = i + 1;
        //         this.fileIdx = this.fileList[i].index;
        //     }
        // }
        // this.fileData = {'filename': '', 'base64': '', 'recordId': ''};
        // this.fileList = [];
        // this.fileList = {'index' : '', 'filename' : '', 'base64' : '', 'recordId' : ''};
        console.log('fList :: ',JSON.stringify(this.fileList));
    }

    // 파일 업로드
    fileUpload(e) {
        this.fileIdx = this.item[e.target.dataset.id-1].index;  // 선택한 행의 파일을 지우기 위한 item의 index 값 가져오기

        const file = e.target.files[0];
        const fileSize = file.size;
        const fileMaxSize = 10 * 1024 * 1024;

        var fileLength = file.name.length;
        var fileNameExt = file.name.lastIndexOf(".");
        var fileExtType = '.' + file.name.substring(fileNameExt + 1, fileLength).toLowerCase(); // 파일 확장자 가져오기

        if(this.fileAcceptType.includes(fileExtType)) {
            if(fileSize > fileMaxSize) {
                this.template.querySelector('c-ig_custom-toast').showToast('', '파일 사이즈가 너무 거대합니', 'warning');
            } else {
                var fileReader = new FileReader();
                var Img = new Image();
                let resizeImg;
                fileReader.onload = (base64) => {
                    Img.src = base64.target.result;
                    Img.onload = (e) => {
                        var canvas = document.createElement('canvas');
                        var ctx  = canvas.getContext("2d");
                        canvas.width = 794;
                        canvas.height = 1123;
                        ctx.drawImage(e.target, 0, 0, 794, 1123);
                        resizeImg = canvas.toDataURL('image/jpg', 0.5).split(',')[1];
                        this.fileData = {
                            'filename': file.name,
                            'base64': resizeImg,
                            'recordId': this.recordId
                        };
                        this.fileList.push({'index' : this.fileIdx, 'filename' : file.name, 'base64' : resizeImg, 'recordId' : this.recordId});
                        
                    }

                }
                console.log('fileIdx :: ',this.fileIdx);
                fileReader.readAsDataURL(file);
                this.fileload = e.target.value;
                console.log(' this.item =>>> ', JSON.stringify(this.item));
                // this.file = this.item[e.target.dataset.id-1].file;

                // let targetEle = this.template.querySelector('div[data-fileindex="' + e.target.dataset.id + '"]');
                // targetEle.innerHTML = '<button style="padding:unset;" data-id={it.value.index}>삭제</button>';
                // console.log('targetEle :: ',targetEle.innerHTML);
                // console.log('target :: ',e.target.dataset.id);

                // targetEle.onclick = function(e) {
                //     console.log('idx :: ',e.target.dataset.id);
                //     console.log('fData :: ',JSON.stringify(this.fileData));
                //     console.log('fList :: ',JSON.stringify(this.fileList)); 
                //     targetEle.innerHTML = '';
                //     console.log('del :: ',targetEle.innerHTML);
                //     this.deleteFile = true;
                // }
                console.log('fList :: ',JSON.stringify(this.fileList));
                // this.item[e.target.dataset.id -1].file = Object.assign(this.item[e.target.dataset.id -1].file, this.fileData);
                // console.log('this.item[e.target.dataset.id -1].file  =>   ', this.item[e.target.dataset.id -1].file);
            }
        } else {
            this.template.querySelector('c-ig_custom-toast').showToast('', '확장자명을 체크해주세욥', 'warning');
        }
    }

    // 상품 등록하기
    onSubmit() {
        console.log('fList :: ',JSON.stringify(this.fileList));
        console.log('item[] :: ',JSON.stringify(this.item));
        console.log('fList.length :: ',this.fileList.length);
        if(!this.brand || !this.keyboardType || !this.productName || !this.keyboardName || !this.productPrice) {
            this.template.querySelector('c-ig_custom-toast').showToast('', '빈칸을 채워주세요~~!!', 'warning');
        } else if(!this.productNum || this.productNum == 0) {
            console.log('else');
            this.template.querySelector('c-ig_custom-toast').showToast('', '수량에 1 이상의 숫자를 입력해주세요~~!!', 'warning');
        } else {
            submitProduct({submitData : JSON.stringify(this.item)}).then(res => {
                for(let i = 0; i < this.fileList.length; i++) {
                    console.log('res[i].Id ::  ',res[i].Id);
                    this.fileList[i].recordId = res[i].Id;
                    console.log('this.fileList[i].recordId =>>  ', this.fileList[i].recordId);
                }
                console.log('res :: ',res);
                this.template.querySelector('c-ig_custom-toast').showToast('', '상품 등록 성공~~!!', 'success');
                if(this.fileList) {
                    for(let i = 0; i < this.fileList.length; i++) {
                        var {filename, base64, recordId} =  this.fileList[i];
                        console.log('re :: ',this.fileList[i].recordId);
                        console.log('{filename, base64, recordId} =>> ' , JSON.stringify({filename, base64, recordId}));
                        uploadFile({base64, filename, recordId}).then(res => {
                            console.log('res file :: ',res);
                            this.fileList = [];
                        }).catch(err => {
                            console.log('err :: ',err);
                            this.template.querySelector('c-ig_custom-toast').showToast('', '이미지 등록에 실패하였습니다', 'warning');
                        });
                    }
                } else {
                    console.log('fileList :: ',this.fileList);
                }
            }).catch(err => {
                console.log('err :: ',err);
                this.template.querySelector('c-ig_custom-toast').showToast('', '상품 등록에 실패하였습니다 관리자에게 문의하여주세유유', 'warning');
            });            
        }
    }

    // 파일 삭제 버튼
    fileDelete(e) {
        console.log('0');
        for(let i = 0; i < this.fileList.length; i++) {
            console.log('1');
            console.log('e.target.dataset.id :: ',e.target.dataset.id);
            if(this.fileList[i].index == e.target.dataset.id) {
                console.log('2');
                this.fileList[i] = [{'index' : this.fileIdx, 'filename' : '', 'base64' : '', 'recordId' : ''}];
                console.log('3');
            }
        }
        // this.fileList[e.target.dataset.id-1] = {'index' : this.fileIdx,'filename' : '', 'base64' : '', 'recordId' : ''};
        console.log('fList :: ',JSON.stringify(this.fileList));
    }
}