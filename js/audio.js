//打开网页首先each每一个组件，得到它们的各自的number
$(".audio-container").each(function(num, value) {
	var $container = $(this)
	var audio = $container.find("audio")[0]
	// console.log($audio);
	var haveHour = false; //默认时长不超过1小时
	var ctid; //时间定时器

	var progressTimer; //进度条定时器
	
	var progress_bar = $container.find(".progress-bar")[0]; //进度条圆点
	var progress = $container.find(".progress")[0]; //进度条
	
	var volume_bar = $container.find(".volume-bar")[0]; //音量表圆点
	var volume = $container.find(".volume")[0]; //音量表
	var volumeColor = getComputedStyle(document.documentElement).getPropertyValue('--audio-volumeColor');
	var baseBackgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--audio-baseBackgroundColor');
	var volumeWrappers = $container.find(".volume-wrappers")[0];
	
	//音频文件加载完成后执行(初始化)
	audio.oncanplay = function() {
		var dtime = audio.duration; //时间
		haveHour = dtime >= 3600;
		$container.find(".dtime")[0].innerHTML = makeTime(dtime);
		curTime();
		setProgress();
	}

	//播放
	function play() {
		$container.find(".audio-pause")[0].style.display = "block"
		$container.find(".audio-play")[0].style.display = "none"
		audio.play();
		ctid = setInterval(function() {
			curTime();
		}, 1000) //设置定时器
		progressTimer = setInterval(function() {
			setProgress();
		}, 200)
	}

	//暂停
	function pause() {
		$container.find(".audio-pause")[0].style.display = "none"
		$container.find(".audio-play")[0].style.display = "block"
		audio.pause();
		clearInterval(ctid)
	}

	//点击事件
	$container.find(".audio-play")[0].onclick = function() {
		play();
	}
	$container.find(".audio-pause")[0].onclick = function() {
		pause();
	}

	//时间格式
	function makeTime(time) {
		time = Math.floor(time);
		var hour = Math.floor(time / 3600);
		var min = Math.floor((time - hour * 3600) / 60);
		var second = time - hour * 3600 - min * 60;
		// min = min < 10 ? "0"+ min : min;
		second = second < 10 ? "0" + second : second;
		if (haveHour) {
			hour = hour < 10 ? "0" + hour : hour;
			return hour + ":" + min + ":" + second;
		}
		return min + ":" + second;
	}

	//当前播放时间
	function curTime() {
		$container.find(".ctime")[0].innerHTML = makeTime(audio.currentTime);
	}

	//进度条设置
	var long;
	
	progress_bar.onmousedown = function(event) {
		event = event || window.event;
		event.stopPropagation();
		//获取圆点偏移量
		var progressLeft = event.clientX - this.offsetLeft;
		console.log(event.clientX);
		// 为右侧圆点绑定拖动事件
		document.onmousemove = function(event) {
			//进度条拖拽
			long = parseInt($container.find(".progress-wrapper").css("width"));
			event = event || window.event;
			// 获取鼠标坐标
			var progressX = event.clientX - progressLeft;
			// 暂停拖动（如果拖动条超出范围，则停止拖动）
			if (progressX <= 0) {
				progressX = 0;
			} else if (progressX >= long) {
				progressX = long;
			}
			// console.log(progressX);
			progress_bar.style.left = progressX + "px";
			// 显示进度条
			progress.style.width = progressX + "px";
			// 显示进度条百分比
			// console.log(progressX / long);
			audio.currentTime = progressX / long * audio.duration;

		};

		// 为右侧圆点绑定鼠标抬起事件
		document.onmouseup = function(event) {
			console.log(document.onmousemove);
			// console.log($container.find(".speed")[0].onmousemove);
			event = event || window.event;
			// 取消鼠标移动事件
			document.onmousemove = null;
			// 取消鼠标抬起事件
			document.onmouseup = null;
		};
		return false;
	};
	
	//点击事件，如果用onclick会与拖拽事件冲突形成BUG
	$container.find(".progress-wrapper")[0].onmousedown = function(event) {
		//记录起始x值
		var x1 = event.clientX;
		var y1 = event.clientY;
	
		document.onmouseup = function(event) {
			//记录结束x值
			var x2 = event.clientX;
			var y2 = event.clientY;
			//对比判断是否点击事件
			if (x1 == x2 && y1 == y2) {
				// console.log(1);
				event = event || window.event;
				long = parseInt($container.find(".progress-wrapper").css("width"));
				// console.log(e.offsetX);
				
				var cur = event.offsetX / long;
				
				audio.currentTime = cur * audio.duration;
				// console.log(cur + "px");
				progress.style.width = cur + "px";
				progress_bar.style.left = cur + "px";
			}
			//注销事件，如果不注销move事件会一直存在
			// document.onmousemove = null;
			document.onmouseup = null;
		}
		return false;
	}
	function setProgress() {
		long = parseInt($container.find(".progress-wrapper").css("width"))
		var cur = audio.currentTime / audio.duration * long;
		progress.style.width = cur + "px";
		progress_bar.style.left = cur + "px";
	}
	//静音
	$container.find(".mute")[0].onclick = function() {
		var muted = audio.muted;
		if (muted) {
			this.className = "mute";
			$container.find(".volume")[0].style.width = $container.find(".volume-wrapper").css("width");
			$container.find(".volume-bar")[0].style.left = $container.find(".volume-wrapper").css("width");
			audio.volume = 1;
		} else {
			this.className = "mute muted";
			$container.find(".volume")[0].style.width = 0 + "px";
			$container.find(".volume-bar")[0].style.left = 0 + "px";
			audio.volume = 0;
		}
		//把布尔值取反
		audio.muted = !muted;
	}

	//音量
	
	//鼠标移入音量表弹出
	$(".audio-container .sound")[num].onmouseover = function() {
		volumeWrappers.style.width = "80px";
		$container.find(".sound")[0].style.backgroundColor = volumeColor;
		volumeWrappers.style.backgroundColor = volumeColor;
	}
	$(".audio-container .sound")[num].onmouseout = function() {
		volumeWrappers.style.width = "0px";
		$container.find(".sound")[0].style.backgroundColor = baseBackgroundColor;
		volumeWrappers.style.backgroundColor = baseBackgroundColor;
	}
	//音量表的拖拽
	var volumeLong;
	
	volume_bar.onmousedown = function(event) {
		event = event || window.event;
		event.stopPropagation(); //阻止事件向上传递，避免触发背景线点击事件
		//获取圆点偏移量
		var volumeLeft = event.clientX - this.offsetLeft;
		console.log(event.clientX);
		// 为右侧圆点绑定拖动事件
		document.onmousemove = function(event) {
			//音量表拖拽
			//获取总长度
			volumeLong = parseInt($container.find(".volume-wrapper").css("width"))
			event = event || window.event;
			// 获取鼠标坐标
			var volumeX = event.clientX - volumeLeft;
			// 暂停拖动（如果拖动条超出范围，则停止拖动）
			if (volumeX <= 0) {
				volumeX = 0;
			} else if (volumeX >= volumeLong) {
				volumeX = volumeLong;
			}
			// console.log(progressX);
			volume_bar.style.left = volumeX + "px";
			// 显示进度条
			volume.style.width = volumeX + "px";
			// 显示进度条百分比
			// console.log(progressX / long);
			audio.volume = volumeX / volumeLong;
	
		};
	
		// 为右侧圆点绑定鼠标抬起事件
		document.onmouseup = function(event) {
			console.log(document.onmousemove);
			event = event || window.event;
			// 取消鼠标移动事件
			document.onmousemove = null;
			// 取消鼠标抬起事件
			document.onmouseup = null;
		};
		return false;
	};
	//音量表点击事件
	$container.find(".volume-wrapper")[0].onmousedown = function(event) {
		//记录起始x值
		var x1 = event.clientX
		document.onmouseup = function(event) {
			//记录结束x值
			var x2 = event.clientX;
			//对比判断是否点击事件
			if (x1 == x2) {
				// console.log(1);
				event = event || window.event;
				volumeLong = parseInt($container.find(".volume-wrapper").css("width"));
				// console.log(event.offsetX);
				audio.volume = event.offsetX / volumeLong;
				volume.style.width = event.offsetX + "px";
				volume_bar.style.left = event.offsetX + "px";
			}
			// document.onmousemove = null;
			document.onmouseup = null;
		}
		return false;
	}
	//点击弹出播放倍速选择
	$container.find(".speed i")[0].onclick = function() {
		$container.find(".speed ul")[0].style.height = "180px";
	}
	//选择倍速
	$container.find(".speed ul")[0].onclick = function(e){
		// console.log(e.target);
		if(e.target.nodeName == "LI"){
			// console.log($(this).html());
			$container.find(".speed ul")[0].style.height = "0px";
			// console.log(audio);
			audio.playbackRate = e.target.innerHTML;
		}
	}
	//点击外面关闭下拉
	$(document).mouseup(function(e){
		
		var targetArea = $container.find(".speed ul");
		
		if(!targetArea.is(e.target) && targetArea.has(e.target).length === 0){
			targetArea[num].style.height = "0px";
		}
	})
})

