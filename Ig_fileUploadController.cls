public with sharing class Ig_fileUploadController {

    @AuraEnabled
    public static String uploadFile(String base64, String filename, String recordId) {
        System.debug('base64 :: ' + base64);
        System.debug('filename :: ' + filename);
        System.debug('recordId :: ' + recordId); // 상품 Id값
        ContentVersion cv = createContentVersion(base64, filename);
        ContentDocumentLink cdl = createContentLink(cv.Id, recordId);
        createContentDistribution(cdl.ContentDocumentId, recordId);

        if (cv == null || cdl == null) { return null; }
        return cdl.Id;
    }

    private static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        System.debug('cv.VersionData :::   ' + cv.VersionData);
        cv.Title = filename;
        cv.PathOnClient = filename;
        try {
            insert cv;
            return cv;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }
    
    private static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        System.debug('contentVersionId ::: ' +contentVersionId);
        
        if (contentVersionId == null || recordId == null) { return null; }
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [
            SELECT ContentDocumentId
            FROM ContentVersion
            WHERE Id =: contentVersionId
        ].ContentDocumentId;
        cdl.LinkedEntityId = recordId;
        System.debug('cdl.LinkedEntityId ::: ' + cdl.LinkedEntityId);
        try {
            insert cdl;
            return cdl;
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
    }
    
    private static void createContentDistribution(String id, String recordId) {
        ContentDistribution cdb = new ContentDistribution();
        ContentVersion cv = [select id from contentversion where contentdocumentid = :id];
        cdb.ContentVersionId = cv.id;
        cdb.Name = string.valueOf([SELECT PathOnClient FROM ContentVersion WHERE Id = :id LIMIT 1]);
        cdb.PreferencesAllowViewInBrowser= true;
        cdb.PreferencesLinkLatestVersion=true;
        cdb.PreferencesNotifyOnVisit=false;
        cdb.PreferencesPasswordRequired=false;
        cdb.PreferencesAllowOriginalDownload= true;
        cdb.RelatedRecordId = recordId;
        // cdb.ContentDocumentId = id;
        insert cdb;
    }
}