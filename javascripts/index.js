// JavaScript Document

var topics;
var users;
var ratioDistribution;
var dailyJSON;
var genderJSON;
var urlJSON;
var geo_url;

function getTopicsArray(){
	var t = new Array();
	$('.topic_input').each(function(){
	 t.push($(this).val()); 
	});
	return t;
}

function findSWF(movieName) {
  if (navigator.appName.indexOf("Microsoft")!= -1) {
    return window[movieName];
  } else {
    return document[movieName];
  }
} 

function getDomain(url) {
    if(url && url != "")
        return (url.match(/:\/\/(.[^/]+)/)[1]).replace('www.','');
    else
        return "unknown";
}
function init()
{
    topics = new Array();
    users = new Array();
    ratioDistribution = new Array();
    genderJSON = new Array();
    dailyJSON = new Array();
    urlJSON = new Array();
    geo_url = new Array();
}

$(document).ready(function() {  

    $('#analysis').click(function(){
        $(".background").fadeIn("slow", function(){
            init();
            TA.init();
            topics = getTopicsArray();
            TA.search_by_topics(topics);
            $('.background').fadeOut("slow");
            $('#analysis_action').fadeIn("slow");
        });
            
    });

    $('#friend_follower').click(function()
    {
       $("#geo_box").hide();
        for(var j=0; j<topics.length; j++)
        {
            users[j] = new UserList(topics[j]);
            users[j].calculateRatio();
            ratioDistribution[j] = users[j].drawRatio();
        }

        var labels = [];
        for(var i=0;i<10;i++)
        {
            labels[i] = Math.floor(0.5*i*100)/100 + '';
        }

        var ratioJSON = 
        {
            "title":{
                "text":"Friend/Follower Ratio",
                "style":"font-size: 14px; font-family: Verdana; text-align: center;"
            },
            "x_axis":{
                "labels":{
                    "steps":1,
                    "labels": labels
                }
            },
            "y_legend":{
                "text": "Number of users",
                "style": "{color: #736AFF; font-size: 12px;}"
            },
            "y_axis":{
                "offset":      0,
                "max":         200,
                "steps":       20
            },
            "bg_colour":"#ffffff",
            "elements":[{
                "type":"bar",
                "colour":"#BF3B69",
                "text":topics[0],
                "values":ratioDistribution[0],
                "dot-size":3,
                "fill-alpha":0.6
            },{
                "type":"bar",
                "colour":"#5E0722",
                "text":topics[1],
                "values":ratioDistribution[1],
                "dot-size":3,
                "fill-alpha":0.6
            }]
        };


        tmp = findSWF("chart"+(1));
        x = tmp.load(JSON.stringify(ratioJSON));
        $('#chart1').css("visibility", "visible");
        $('#chart2').css("visibility", "hidden");
    });

    $('#gender').click(function()
    {
       $("#geo_box").hide();
        for(var j=0; j<topics.length;j++)
        {
            users[j] = new UserList(topics[j]);
            genderJSON[j] = users[j].calculateGender();
            tmp = findSWF("chart"+(j+1));
            x = tmp.load(JSON.stringify(genderJSON[j]));
            $('#chart'+(j+1)).css("visibility","visible");
        }
    });

    $('#clear').click(function(){
        init();
        TA.init();
        $('#chart1').css("visibility", "hidden");
        $('#chart2').css("visibility", "hidden");
        $('#analysis_action').fadeOut("slow");
       $("#geo_box").hide();
        

    });


    $('#daily').click(function()
    {
       $("#geo_box").hide();
        for(var j=0; j<topics.length; j++)
        {
            users[j] = new UserList(topics[j]);
            users[j].calculateDaily();
            dailyJSON[j] = users[j].drawDaily();
        }
       
        for(i=1;i<=2;i++)
        {
            tmp = findSWF("chart"+(i));
            x = tmp.load(JSON.stringify(dailyJSON[i-1]));
            $('#chart'+i).css("visibility", "visible");
            $('#chart'+i).css("visibility", "visible");
        }
    });
   
    $('#url').click(function(){

       $("#geo_box").hide();
        for(var j=0; j<topics.length; j++)
        {
            users[j] = new UserList(topics[j]);
            users[j].calculateUrl();
            urlJSON[j] = users[j].drawUrl();
        }
        
        for(i=1;i<=2;i++)
        {
            tmp = findSWF("chart"+(i));
            x = tmp.load(JSON.stringify(urlJSON[i-1]));
            $('#chart'+i).css("visibility", "visible");
            $('#chart'+i).css("visibility", "visible");
        }
    
    });

    $('#geo').click(function()
    {
        var color = [];
        color[0] = "green";
        color[1] = "red";

        var prefix = "http://maps.googleapis.com/maps/api/staticmap?zoom=1&size=640x300&maptype=roadmap&sensor=false";
        for(var i=0; i<2; i++)
        {
            geo_url[i] = "";
            var q = encodeURIComponent(topics[i])
            for(var j=0; j<10; j++)
            {
                var len = TA.querys[q][j].statuses.length;
                for(var k=0; k<len; k++)
                {
                    var m = TA.querys[q][j].statuses[k];
                    if(m.geo !=null || m.coordiates != null || m.place != null)
                        geo_url[i] = geo_url[i] + "&markers=color:"+color[i]+"%7c"+ Math.floor(m.geo.coordinates[0]*100)/100 + "," + Math.floor(m.geo.coordinates[1]*100)/100;    
                }
            }
       }

       $("#geo_box").show();
       $("#geodistribution1").attr('src', prefix+geo_url[0]);
       $("#geodistribution2").attr('src', prefix+geo_url[1]);
    });
 
});

