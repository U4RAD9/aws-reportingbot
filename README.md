### List of updates I've done in the deployed Orthanc (PACS) Reporting Bot Architecture - Himanshu.
---------------------------------------------------------------------------------------------------------
I've cloned this on 29th nov 24 , and the last commit on this is "data" and the 2nd last is "pacs update" done by aman sir.

---------------------------------------------------------------------------------------------------------
These are all the steps that i took to resolve the pdf/report generation for our new viewer : 
1. I've added this line in each line at the end to get the logo on the ckeditor :
    "generatePatientTable={this.generatePatientTable()}".
2. I've updated the download and Upload xray report functions, (Still the MR file report generation logic edit/creation is remaining.). -- It's not correct yet (I've to use different approach , maybe by getting the complete data directly from the ckeditor tag and use it as it is , for better configuration of the reports.)
3. I've also fixed the git conflicts with the production and our repo too. - 3 Nov.
4. Now, I've updated the code to fix the api issue faced with the done button. (Right now, it is still attached with the Done button , will change it later wrt the response of the pdf generation.) - 5 Nov.
5. Now, i have pushed the api error code in repo.
6. Added the static/staticfiles data to the code to further solve the git conflicts.