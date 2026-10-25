Użyłem tu layer architecture

Baza: postgresql

Przechowywanie plików: cloudflare r2

Język: Typescript
Framework: Express
Srodowisko: Node

/login			
/register 		
/registerEnd 
/forgotPassword	
/resetPassword
/logout
/refresh
/lawsuits/addLawsuit                            //dodawanie spraw
/lawsuits/members/:lawsuitId		            //dodawanie usera do sprawy
/lawsuits/addEvidence/:lawsuitId	            //dodawanie dowodu
/evidences/:evidenceId/files		            //dodawanie pliku do dowodu
/lawsuits/takelawsuits			                //sprawy
/lawsuits/takelawsuit/:lawsuitId	            //szczegóły sprawy, czyli lista evidence
/evidences/takeEvidence/:evidenceId	            //szczegóły evidence, czyli lista plików
/evidences/:evidenceId/file/:fileId/download	//pobieranie pliku





