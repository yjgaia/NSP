NSP.GenerateErrorDisplay = METHOD({
	
	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.path
		//REQUIRED: params.startIndex
		//REQUIRED: params.endIndex
		//REQUIRED: params.startLine
		//REQUIRED: params.startColumn
		//REQUIRED: params.endLine
		//REQUIRED: params.endColumn
		//REQUIRED: params.error
		
		let errorDisplay = '';
		
		errorDisplay += '<p><b>' + params.error + '</b></p>';
		errorDisplay += '<p><b>path: </b>' + params.path + ' (' + params.startLine + ':' + params.startColumn + '~' + params.endLine + ':' + params.endColumn + ')</p>';
		errorDisplay += '<pre>' + NSP.Compile.getSavedCodes()[params.path].substring(params.startIndex, params.endIndex) + '</pre>';
		
		return errorDisplay;
	}
});