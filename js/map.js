function mouseover(){
	var myElement = document.querySelector("#svg1");
        var rect = myElement.getBoundingClientRect();
	var tooltip_line_length = 10;
	d3.select(this)
		.style("opacity","0.5");
	var centroid;
	var name;
	var party = [];
	var elected = [];
	var p_name = [];
	d3.select(this)
		.each(function(d){
			centroid = path.centroid(d);
			name = d.properties.town;
			for(var i=0;i<d.properties.data_year[now_map].party_list.length;i++){
			party.push(d.properties.data_year[now_map].party_list[i].party_name);
			elected.push(d.properties.data_year[now_map].party_list[i].rate);
			p_name.push(d.properties.data_year[now_map].party_list[i].name);
			}
			
		});
	
	var x = centroid[0]+rect.left;
	var y = centroid[1]+rect.top;
	
	d3.select("#tooltip1")
		.style("display","block")
		.style("top",y+'px')
		.style("left",x+tooltip_line_length+'px');
	
	d3.select("#tooltip_captain")
		.html(name);
	d3.select("#tooltip_table")
                        .append("tr")
                        .attr("id","tr_title");
	d3.select("#tr_title")
		.append("td")
		.html("候選人");
	d3.select("#tr_title")
		.append("td")
		.html("政黨");
	d3.select("#tr_title")
                .append("td")
                .html("當選人數比例");
	
	for(var i=0;i<party.length;i++){
		d3.select("#tooltip_table")
			.append("tr")
			.attr("id","tr" + i.toString());
		d3.select("#tr"+i.toString())
			.append("td")
			.html(p_name[i]);
		d3.select("#tr"+i.toString())
			.append("td")
			.html(party[i]);
		d3.select("#tr"+i.toString())
			.append("td")
			.html(elected[i].toString()+"%");
	}	
	//alert(party);
	
}
function mouseout(){
	
	d3.select("#tooltip1")
		.style("display","none");
	var myNode = document.getElementById("tooltip_table");
	while (myNode.firstChild) {
    		myNode.removeChild(myNode.firstChild);
	}
	
	d3.select(this)
                .style("opacity","1.0");
}

function set_color(svg,number){
	svg.selectAll("path")
		.style("fill",function(d){
			return d.properties.color[labels.indexOf(number)];
		});
}
function fetch_name(name){
	return name[0] + name[1];
}
function unique_year(csv){
	
	year_array = [];
	for(var i=0;i<csv.length;i++){	
		if(year_array.indexOf(csv[i].year) == -1){
			year_array.push(csv[i].year);
			for(var j=year_array.length-1;j>0;j--){
				if(year_array[j-1]>year_array[j]){
					var tmp = year_array[j];
					year_array[j] = year_array[j-1];
					year_array[j-1] = tmp;
				}
				else{
					break;
				}
			}
		}
	}
	return year_array;
	
}

function party(name,rate,party_name){
	this.name = name;
	this.rate = rate;
	this.party_name = party_name;
}
function year_data(year,party_list){
	this.year=year;
	this.party_list = party_list;
}
function initial_struct(json){
	for(var i=0;i<json.features.length;i++){
		json.features[i].properties.data_year = [];
		json.features[i].properties.color = [];
		for(var j=0;j<labels.length;j++){
			json.features[i].properties.data_year.push(new year_data(labels[j],[]));
		}
	}
}
function bind_data(json1,json2,csv){
	initial_struct(json1);
	initial_struct(json2);
	for(var i=0;i<csv.length;i++){
		bind_by_year(csv,i,json2);
		bind_by_year(csv,i,json1);
		/*
		if(csv[i].year<2010){
			bind_by_year(csv,i,json2);
		}
		else{
			bind_by_year(csv,i,json1);
		}
		*/
	}
	
	
}
function bind_by_year(csv,i,json){
	for(var j=0;j<json.features.length;j++){
			if(json.features[j].properties.county == csv[i].地區){
				json.features[j].properties.data_year[labels.indexOf(csv[i].year)].party_list.push(new party(csv[i].姓名,fetch_percent(csv[i].得票率),csv[i].推薦政黨));
				var index = labels.indexOf(csv[i].year);
				var last = json.features[j].properties.data_year[index].party_list.length - 1;
				
				for(var k=last;k>0;k--){
					if(json.features[j].properties.data_year[index].party_list[k-1].rate<json.features[j].properties.data_year[index].party_list[k].rate){
						var tmp = json.features[j].properties.data_year[index].party_list[k];
						json.features[j].properties.data_year[index].party_list[k] = json.features[j].properties.data_year[index].party_list[k-1];
						json.features[j].properties.data_year[index].party_list[k-1] = tmp;
					}
					else{
						break;
					}
				}
				
				break;
			}
		}
}
function fetch_percent(percent){
	var tmp = "";
	for(var i=0;i<percent.length-1;i++){
		tmp += percent[i];
	}
	tmp = parseFloat(tmp);
	return tmp;
}

function swap(array,index1,index2){
	var tmp = array[index1];
	array[index1] = array[index2];
	array[index2] = tmp;
}
function partyToColor(party){
			switch(party){
				case "中國國民黨": return "#000094";
				case "民主進步黨": return "#009A52";
				case "新黨": return "#FFDB00";
				case "綠黨": return "#8FC31F";
				case "親民黨": return "#E77919";
				case "台灣團結聯盟": return "#A25B09";
				case "無黨團結聯盟": return "#C20F51";
				case "臺灣建國黨": return "#31B2EA";
				case "無黨籍及未經政黨推薦": return "#A0A0A0";
				default: return "black";
			}
		}
function calculate_color(json){
	for(var i=0;i<json.features.length;i++){
		if(json.features[i].properties.data_year[0].party_list[0] === undefined){
			json.features[i].properties.color.push("black");
		}
		else{
			json.features[i].properties.color.push(partyToColor(json.features[i].properties.data_year[0].party_list[0].party_name));
		}
		for(var j=1;j<json.features[i].properties.data_year.length;j++){
			if(json.features[i].properties.data_year[j].party_list[0] === undefined){
				var last = json.features[i].properties.color.length - 1;
				json.features[i].properties.color.push(json.features[i].properties.color[last]);
			}
			else{
			json.features[i].properties.color.push(partyToColor(json.features[i].properties.data_year[j].party_list[0].party_name));
			}
		}
	}
}
function getCentroid(obj) {
	bbox = obj.getBBox();
 	return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}
function move(elem,svg,json1){
	var left = 0;
	var id;
	function frame(){
		var con_width = 400;
		left++;
		elem.style.left = left+'px';
		if(left == con_width){
			clearInterval(id);
			now_map = labels.length -1;
			set_color(svg,labels[labels.length-1]);
		}
		for(var i=0;i<labels.length;i++){
			if(i*(con_width/(labels.length-1))<=left && left<(i+1)*(con_width/(labels.length-1))){
				now_map = i;
				set_events(now_map);
				if(labels[i]>=2010){
					
					svg.selectAll("path")	
						.remove();
					
					svg.selectAll("path")
                                                .data(json1.features)
                                                .enter()
                                                .append("path")
                                                .attr("d",path)
                                                .style("fill",function(d){
                                                        return d.properties.color[i];
                                                })
						.on("mouseover",mouseover)
						.on("mouseout",mouseout);
				}
				else{
					set_color(svg,labels[i]);
				}
				break;
			}
		}
	}
	id=setInterval(frame,20);
}
function set_play_onclick(svg,img,json1,json2){	
	var con_width = 400;
	d3.select("#play")
		.on("click",function(){
			now_map = 0
			svg.selectAll("path")	
				.remove();		
			svg.selectAll("path")
                                .data(json2.features)
                                .enter()
                                .append("path")
                                .attr("d",path)
				.on("mouseover",mouseover)
				.on("mouseout",mouseout)
                                .style("fill",function(d){
     		                           return d.properties.color[now_map];
                                });
			set_events(now_map);
			move(img,svg,json1);
		});
	d3.select("#turn_left")
		.on("click",function(){
			if(now_map > 0){
				now_map -= 1;
				img.style.left = now_map*(con_width/(labels.length-1)) +"px";
				if(labels[now_map]<2010){
					set_events(now_map);
					svg.selectAll("path")	
						.remove();
					
					svg.selectAll("path")
                                                .data(json2.features)
                                                .enter()
                                                .append("path")
                                                .attr("d",path)
                                                .style("fill",function(d){
                                                        return d.properties.color[now_map];
                                                })
						.on("mouseover",mouseover)
						.on("mouseout",mouseout);
				}
				else{
					set_events(now_map);
					set_color(svg,labels[now_map]);
				}
			}
		})	
	d3.select("#turn_right")
                .on("click",function(){
                        if(now_map < labels.length-1){
                                now_map += 1;
				set_events(now_map);
                                img.style.left = now_map*(con_width/(labels.length-1)) +"px";
				if(labels[now_map]>=2010){
					
					svg.selectAll("path")	
						.remove();
					
					svg.selectAll("path")
                                                .data(json1.features)
                                                .enter()
                                                .append("path")
                                                .attr("d",path)
                                                .style("fill",function(d){
                                                        return d.properties.color[now_map];
                                                })
						.on("mouseover",mouseover)
						.on("mouseout",mouseout);
				}
				else{
					set_color(svg,labels[now_map]);
				}
                        }
                })
}
function set_player(svg,json1,json2){
	var con_width = 400;
	var width = 12;
	var height = 25;
	var src = "play_bar.png";
	var img = document.createElement("img");
	var year_list = labels;
    	img.src = src;
    	img.width = width;
    	img.height = height;
	document.querySelector("#bar_container").appendChild(img);
	move(img,svg,json1);
	set_play_onclick(svg,img,json1,json2);
	var tmp_sum = 0;
	
	for(var i=0;i<year_list.length;i++){
		var events =[['第 01 屆直轄市市長、市議員選舉','第 10 屆 台灣省議員選舉'],['第 13 屆 縣(市)長選舉'],['第 02 屆 直轄市市長、市議員選舉','第 04 屆 立法委員選舉','第 14 屆 縣(市)議員選舉','第 13 屆 鄉鎮(縣轄市)長選舉'],['第 05 屆 立法委員選舉','第 14 屆 縣(市)長選舉'],['第 03 屆 直轄市市長、市議員選舉','第 15 屆 縣(市)議員選舉','第 14 屆 鄉鎮(縣轄市)長選舉'],['第 15 屆 縣(市)長選舉','第 16 屆 縣(市)議員選舉','第 15 屆 鄉鎮(縣轄市)長選舉'],['第 04 屆 直轄市市長、市議員選舉'],['第 16 屆 縣(市)長選舉','第 17 屆 縣(市)議員選舉','第 16 屆 鄉鎮(縣轄市)長選舉'],['第 05 屆 直轄市台北市長選舉','第 11 屆 台北市議員選舉','第 01 屆 直轄市新北、台中、台南、高雄市長、市議員選舉'],['九合一選舉']]; 
		//alert(i*(con_width/(labels.length-1)));
		d3.select("#label_container")
			.append("span")
			.style("font-size","12px")
			.style("position","absolute")
			.style("left",i*(con_width/(labels.length-1))+"px")
			.html(labels[i]);
	}
	
}
function set_events(num){
	var myNode = document.getElementById("events_container");
	while (myNode.firstChild) {
    		myNode.removeChild(myNode.firstChild);
	}
	d3.select("#events_container")
			.append("div")
			.text("該年政治事件");
	var events =[['第 01 屆直轄市市長、市議員選舉','第 10 屆 台灣省議員選舉'],['第 13 屆 縣(市)長選舉'],['第 02 屆 直轄市市長、市議員選舉','第 04 屆 立法委員選舉','第 14 屆 縣(市)議員選舉','第 13 屆 鄉鎮(縣轄市)長選舉'],['第 05 屆 立法委員選舉','第 14 屆 縣(市)長選舉'],['第 03 屆 直轄市市長、市議員選舉','第 15 屆 縣(市)議員選舉','第 14 屆 鄉鎮(縣轄市)長選舉'],['第 15 屆 縣(市)長選舉','第 16 屆 縣(市)議員選舉','第 15 屆 鄉鎮(縣轄市)長選舉'],['第 04 屆 直轄市市長、市議員選舉'],['第 16 屆 縣(市)長選舉','第 17 屆 縣(市)議員選舉','第 16 屆 鄉鎮(縣轄市)長選舉'],['第 05 屆 直轄市台北市長選舉','第 11 屆 台北市議員選舉','第 01 屆 直轄市新北、台中、台南、高雄市長、市議員選舉'],['九合一選舉']];
	for(var i=0;i<events[num].length;i++){
		d3.select("#events_container")
			.append("div")
			.text(events[num][i]);
	}
}
