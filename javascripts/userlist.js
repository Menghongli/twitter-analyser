// Javascript document

function UserList(topic) {
    this.list = {};
    this.ratio = {};
    this.gender = {};
    this.daily = {};
    this.url = {};
    this.topic = topic;
    for(var i=0;i<10;i++)
    {
        var q = encodeURIComponent(topic);
        var length = TA.querys[q][i].statuses.length;
        for(var j=0;j<length;j++)
        {
            this.list[TA.querys[q][i].statuses[j].user.id_str]=TA.querys[q][i].statuses[j].user;
        }
    }
}
UserList.prototype.calculateRatio = function(){
    for (var key in this.list)
    {
        if(this.list.hasOwnProperty(key))
        {
            if(this.list[key].followers_count == 0)
                continue;

            this.ratio[key] = this.list[key].friends_count / this.list[key].followers_count;
        }
    }
};

UserList.prototype.calculateDaily = function()
{
    var today = new Date();
    for(var key in this.list)
    {
        if(this.list.hasOwnProperty(key))
        {
            var createDate = new Date(this.list[key].created_at);
            if(createDate == today)
                this.daily[key] = this.list[key].statuses_count;
            else
                this.daily[key] = this.list[key].statuses_count / ((today - createDate) / 1000 / 60 / 60 / 24).toFixed();
        }
    }
};

UserList.prototype.calculateUrl = function()
{
    for(var key in this.list)
    {
        if(this.list.hasOwnProperty(key))
        {
            var domain = this.list[key].entities.url.urls[0].expanded_url;
            if (domain == null)
                domain = this.list[key].entities.url.urls[0].url;
            this.url[key] = getDomain(domain);
        }
    }

};

UserList.prototype.drawUrl = function()
{
    var urlDistribution = {};
    for(var key in this.url)
    {
        if(urlDistribution.hasOwnProperty(this.url[key]))
            urlDistribution[this.url[key]]++;
        else
            urlDistribution[this.url[key]] = 1;
    }
    
    var sortedUrl = [];
    for(var key in urlDistribution) sortedUrl.push([key, urlDistribution[key]]);

    sortedUrl.sort(function(a, b){
        a = a[1];
        b = b[1];

        return a < b ? 1 : (a > b ? -1 : 0);
    });
    
    var top10 = [];
    for(var i = 0; i < 10; i++)
    {
        if(sortedUrl.length > i)
            top10[i] = sortedUrl[i+1];
        else
            break;
    }

    var domains = [];
    var freqs = [];

    for(var i = 0; i < top10.length; i++)
    {
        domains[i] = top10[i][0];
        freqs[i] = top10[i][1];
    }
    var urlJSON = 
    {
        "title":{
            "text":"Top 10 Profile URL distribution",
            "style":"font-size: 14px; font-family: Verdana; text-align: center;"
        },
        "x_axis":{
            "labels":{
                "steps":1,
                "rotate": 45,
                "labels":domains 
            }
        },
        "y_legend":{
            "text": "Number of users",
            "style": "{color: #736AFF; font-size: 12px;}"
        },
        "y_axis":{
            "offset":      0,
            "max":         100,
            "steps":       10
        },
        "bg_colour":"#ffffff",
        "elements":[{
            "type":"bar_sketch",
            "colour":"#81AC00",
            "outline-colour": "#567300",
            "text":this.topic,
            "values":freqs,
            "dot-size":3,
            "fill-alpha":0.6
        }]
    };
  
    return urlJSON;
};

UserList.prototype.calculateGender = function()
{
    var femaleRequest = new XMLHttpRequest();
    var maleRequest = new XMLHttpRequest();

    var femaleNames = new Array();
    var maleNames = new Array();

    var female_csv_url = "/namedata/census1990_female.csv";
    var male_csv_url = "/namedata/census1990_male.csv";

    femaleRequest.open("GET",female_csv_url,false);
    femaleRequest.send(null)

    if (femaleRequest.status==200)
        femaleNames = csv2array(femaleRequest.responseText, ',');
    else 
        alert("Error executing XMLHttpRequest call!"); 
    
    maleRequest.open("GET", male_csv_url,false);
    maleRequest.send(null);

    if(maleRequest.status==200)
        maleNames = csv2array(maleRequest.responseText);
    else
        alert("Error executing XMLHttpRequest call!");
    
    var genderDistribution = [0,0,0];

    for (var key in this.list)
    {
        unknown = 1;
        var m=0;
        var f=0;
        if(this.list.hasOwnProperty(key))
        {
            while(f<femaleNames.length || m<maleNames.length)
            {
                firstName = this.list[key].name.split(" ")[0].toLowerCase();
                if(f<femaleNames.length && firstName == femaleNames[f][0])
                {
                    genderDistribution[0]++;
                    unknown = 0;
                    break;
                }
                else if(m<maleNames.length && firstName == maleNames[m][0])
                {
                    genderDistribution[1]++;
                    unknown = 0;
                    break;
                }
                m++;
                f++;
            }
            if(unknown)
                genderDistribution[2]++;
        }
    }
    
    var genderJSON = 
    {
        "title":
        {
            "text":"Gender Distribution of topic:"+this.topic, 
            "style":"font-size: 14px; font-family: Verdana; text-align: center;"
        }, 
        "legend":
        {
            "visible":true, 
            "bg_colour":"#fefefe", 
            "position":"right", 
            "border":true, 
            "shadow":true
        }, 
        "bg_colour":"#ffffff", 
        "elements":[{
            "type":"pie", 
            "tip":"#label# #val#<br>#percent#", 
            "values":[
                {
                    "value":genderDistribution[0], 
                    "label":"Female", 
                    "text":"Female"
                },
                {
                    "value":genderDistribution[1], 
                    "label":"Male", 
                    "text":"Male"
                },
                {
                    "value":genderDistribution[2], 
                    "label":"Unknown", 
                    "text":"Unknown gender"
                }
            ], 
            "radius":130, 
            "highlight":"alpha", 
            "animate":true, 
            "gradient-fill":true, 
            "alpha":0.5, 
            "colours":["#0000ff","#00ff00","#ff0000"]
        }]
    }
    return genderJSON;
}

UserList.prototype.drawRatio = function(){
    var sortedRatio = [];
    for(var key in this.ratio)
    {
        if(this.ratio.hasOwnProperty(key))
        {
            sortedRatio.push(this.ratio[key]);
        }
    }

    sortedRatio.sort(function(a,b){return a-b});

    var len = sortedRatio.length;
    //var interval = (sortedRatio[len-1] - sortedRatio[0]) / 100;
    var interval = 0.5
    var ratioDistribution = [];
    var iterator = 0;
    var counter = 0;
    var i = 0;
    while(i<len)
    {
       if(sortedRatio[i]<5)
       {
            if((sortedRatio[i] < interval*(iterator+1)) && (sortedRatio[i] >= interval * iterator))
            {
                counter++;
                i = i + 1;
            }
            else
            {
                ratioDistribution[iterator] = counter;
                counter = 0;
                iterator++;
            }
       }
       else
       {
           i++;
       }
    }
    
            
    
    return ratioDistribution;
};

UserList.prototype.drawDaily = function(){
    var sortedDaily = [];
    for(var key in this.daily)
    {
        if(this.daily.hasOwnProperty(key))
        {
            sortedDaily.push(this.daily[key]);
        }
    }
    sortedDaily.sort(function(a,b){return a-b});

    var len = sortedDaily.length;
    //var interval = (soredDaily[len - 1] - sortedDaily[0]) / 100;
    var interval = 0.5; 
    var dailyDistribution = [];
    var iterator = 0;
    var counter = 0;
    var i = 0;
    while(i<len)
    {
        if(sortedDaily[i]<=50)
        {
            if((sortedDaily[i] < interval*(iterator+1)) && (sortedDaily[i] >= interval * iterator))
            {
                counter++;
                i++;
            }
            else
            {
                dailyDistribution[iterator] = counter;
                counter = 0;
                iterator++;
            }
        }
        else
        {
            i++;
        }
    }

    var labels = [];
    for(var i=0;i<100;i++)
    {
        labels[i] = Math.floor(0.5*i*100)/100 + '';
    }

    var dailyJSON = 
    {
        "title":{
            "text":"Daily user activity",
            "style":"font-size: 14px; font-family: Verdana; text-align: center;"
        },
        "x_axis":{
            "labels":{
                "steps":10,
                "rotate":270,
                "labels": labels
            }
        },
        "y_legend":{
            "text": "Number of users",
            "style": "{color: #736AFF; font-size: 12px;}"
        },
        "y_axis":{
            "offset":      0,
            "max":         100,
            "steps":       10
        },
        "bg_colour":"#ffffff",
        "elements":[{
            "type":"area",
            "colour":"#838A96",
            "fill":"#E01B49",
            "fill-alpha":0.4,
            "text":this.topic,
            "values":dailyDistribution,
            "fill-alpha":0.6
        }]
    };

    return dailyJSON;
};


