(function(){
	TA = {
		config : {
			consumerKey: "X2ovbeL22kf5sa0P4RK4A",
			consumerSecret: "XwslMHbkKqfF9DK6aeuymDA5XvFzXm4e93fyeyFzpsk",

                        accessTokenKey: "134286293-YgvQuTY489rLSjWRc6USQ6zGjd2uXbs8rO0IXa6v",
                        accessTokenSecret: "qXCgM94wSjqH8y0JToiHmfGJPyN7brFZrTByXQF0U",

			requestTokenUrl: "https://api.twitter.com/oauth/request_token",
			authorizationUrl: "https://api.twitter.com/oauth/authorize",
			accessTokenUrl: "https://api.twitter.com/oauth/access_token",
			callbackUrl: "http://127.0.0.1:3000"
		},
		
		oauth : {},
		
		querys : {},
		
                max_id : 0,

		init : function(){
			TA.oauth = new OAuth(TA.config);
			TA.querys = {};
		},
		
		search_by_topics : function(topics){
			for(i = 0; i< topics.length; i++){
                            q = encodeURIComponent(topics[i]);
                            TA.querys[q] = [];
                            for(j =0; j < 10; j++)
                            {
                                if(j == 0)
                                {
                                    TA.activeConnections++;
                                    TA.oauth.getJSON("https://api.twitter.com/1.1/search/tweets.json?q="+ q +"&result_type=mixed&count=100", TA.collectData, TA.failureHandler, false);
                                }
                                else
                                {
                                    TA.oauth.getJSON("https://api.twitter.com/1.1/search/tweets.json?q="+ q +"&max_id="+ TA.max_id +"&result_type=mixed&count=100", TA.collectData, TA.failureHandler, false);
                                }
                            }

			}
				
		}, 
		
		collectData : function(query) {
                        TA.max_id = query.statuses[query.statuses.length - 1].id_str;
			TA.querys[query.search_metadata.query].push(query);

		},
		
		failureHandler : function(data) {
			console.error(data); 
			alert('Something bad happened! :(');
		}
		
	}
	
})();




