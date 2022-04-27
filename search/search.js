var solrServerUrl = "http://159.65.229.247:8080/search";
var maxResults = 10;
var currentPageNo;
var maxPageLinks = 10;

$(document).ready(function(){
	var searchBox = document.getElementById("searchbox");

	searchBox.addEventListener("keydown", function(event) {
		if (event.key === "Enter") {
			search(1);
		}
	});
});

function executeAjaxRequest(url, data, callback){
	$.ajax({
        url: url,
        type: 'get',
		data: data,
        dataType: 'json',
		success: callback
    });
}

function search(pageNo){
	var searchBox = document.getElementById("searchbox");
	var query = searchBox.value;
	var start = (pageNo - 1) * maxResults;
	
	currentPageNo = pageNo;
	
	data = {
		'q':query,
		'start': start,
		'rows': maxResults,
		'fl':'title url',
		'defType':'edismax',
		'qf':'title^50 url content',
		'hl':'on',
		'hl.fl':'title content',
		'hl.fragsize': 300,
		'hl.simple.pre':'<b>',
		'hl.simple.post':'</b>',
		'uniqueKey':'url',
		'displayFields':'hl_title url hl_content',
		'replaceNewLine': true,
	}
	
	executeAjaxRequest(solrServerUrl, data, logData);
}

function logData(data){
	// This method is for debugging purpose.
	console.log(data);
	displayResults(data);
}

function displayResults(results){
	$( "#recordCount" ).empty();
	$( "#results" ).empty();
	
	var recordCountContainer = document.getElementById("recordCount");
	
	var recordCount = results.recordCount;
	recordCount = String(recordCount).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	var docs = results.documentList;
	
	recordCountContainer.appendChild(createRow("row", "Records Found: "+recordCount));
	
	var resultsContainer = document.getElementById("results");

	var title, url, desc;
	
	
	for (let idx = 0; idx < docs.length; idx++) {
		doc = docs[idx];
		
		title = createTitleRow(doc.hl_title, doc.url);
		url = createRow("row text-success", doc.url);
		content = createRow("row mb-3 d-flex justify-content-start", doc.hl_content);
		
		resultsContainer.appendChild(title);
		resultsContainer.appendChild(url);
		resultsContainer.appendChild(content);
	} 
	
	preparePaginationLinks(recordCount);	
}

function preparePaginationLinks(recordCount) {
	var paginationContainer = document.getElementById("pagination");
	
	$(paginationContainer).empty();
	
	if(recordCount <= maxResults){
		return;
	}
	
	var prev;
	var next;
	var lastPageNo = Math.ceil(parseInt(recordCount.replace(",",""))/maxResults);
	
	if(currentPageNo == 1) {
		prev = '<li class="page-item disabled"> <a class="page-link" href="#" tabindex="-1"  aria-disabled="true">Previous</a> </li>';
	} else {
		prev = '<li class="page-item" onclick="search('+(currentPageNo-1)+')"><a class="page-link">Previous</a></li>';
	}
	
	if(lastPageNo == currentPageNo) {
		next = '<li class="page-item disabled"> <a class="page-link" href="#" tabindex="-1"  aria-disabled="true">Next</a> </li>';
	} else {
		next = '<li class="page-item" onclick="search('+(currentPageNo+1)+')"><a class="page-link">Next</a></li>';
	}
	
	var p;
	var i = Math.floor(currentPageNo / maxResults)*maxResults + 1;
	console.log(i);
	var pageLinks = '';
	
	for (i; i <= Math.min(lastPageNo, maxPageLinks); i++){
		if(i == currentPageNo){
			pageLinks += '<li class="page-item active onclick="search('+i+')""><a class="page-link">'+i+'</a></li>';
		} else {
			pageLinks += '<li class="page-item" onclick="search('+i+')"><a class="page-link">'+i+'</a></li>';
		}
	}
	
	var pagination = prev + pageLinks + next;
	
	$(paginationContainer).append(pagination);
}

function createRow(classes, textContent){
	let div = document.createElement('div');
	div.className = classes;
	var textNode = document.createElement('div');
	textNode.innerHTML = textContent;
	div.appendChild(textNode);
	return div;
}

function createTitleRow(title, url){
	let div = document.createElement('div');
	div.className = "row";
	var createA = document.createElement('a');
	//var createAText = document.createTextNode(title);
	createA.setAttribute('href', url);
	createA.setAttribute('target', '_blank');
	createA.innerHTML = title;
	div.appendChild(createA);
	return div;
}