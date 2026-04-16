
/**
 * Web升级功能函数
 */
 
 function getIPConfig() {
		let cmdContent = {
            cmd: "get_network",
        };
		var xhr = new XMLHttpRequest();
		xhr.open('POST','/action/get');
		cmdContent = JSON.stringify(cmdContent);
		xhr.responseType = "json";
		xhr.send(cmdContent);
		xhr.onload = function(){
			console.log(xhr.response);
			document.getElementById("webip").value = xhr.response.ip.ctrl_ip;
			document.getElementById("netmask").value = xhr.response.network.netmask;
			document.getElementById("route").value = xhr.response.network.route;
		}
		
 }
 
 getIPConfig();

function updateWebPkg() {
	var formData = new FormData();
	var file = document.getElementById("webpkgImported").files[0];
	console.log(file);
	if (null == file) {
		alert("未选择文件");
		return;
	}
	formData.append('file', file);
	console.log(formData);
console.log(formData.get('file'));
	var xhr = new XMLHttpRequest();
	var upload_ip = "http://192.168.57.2:8050/action/upload";
	xhr.open('POST',upload_ip);
	//xhr.setRequestHeader('content-type', 'multipart/form-data');
	
	xhr.responseType = "json";
	xhr.send(formData);
	alert("正在升级中，请稍等，点击确定后等待升级成功提示...");
	console.log(xhr.readyState);
	
	xhr.onload = function(e){
		//setTimeout(2000);
		console.log(e.target.status);
		if(e.target.status == 403){
		    alert("升级失败");
		} else if(e.target.status == 200){
		    alert("升级成功，请重启控制箱");
		} else{
		    alert("升级失败");
		}

	}

}


