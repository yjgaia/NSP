# Node Server Pages
Node Server Pages는 Node.js를 기반으로 동적 웹페이지를 생성하기 위해 개발된 서버 스크립트 엔진입니다.

***Node Server Pages는 템플릿 엔진이 아닙니다!***

## 특징
- JavaScript만 알면 서버 프로그래밍에 익숙하지 않아도 즉시 서버 개발이 가능합니다.
- [Node.js의 API](https://nodejs.org/api/)를 모두 사용할 수 있습니다.
- 수많은 [npm 모듈들](https://www.npmjs.com/)을 즉시 사용할 수 있습니다.
- [UPPERCASE-CORE](https://github.com/Hanul/UJS)를 사용할 수 있습니다.
- `.nsp` 페이지가 수정 즉시 반영됩니다.
- 멀티코어 CPU 지원을 내장하고 있습니다.

## 설치
### Node.js 프로젝트
1. `NSP.js`와 `NSP-EMBED.js`, `import` 폴더, `config.json`을 원하는 폴더에 복사합니다.
2. `config.json`을 수정해서 사용합니다.

```json
{
	"port": 8123,
	"isDevMode": true,
	"rootPath": "./",
	"uploadURI": ["examples/upload_result.nsp"],
	"maxUploadFileMB": 10,
	"uploadPath" : "./upload_files"
	"restURI": ["examples/restful"],
    "isNotUsingDCBN" : false,
    "isNotUsingCPUClustering" : false
}
```

- `port` 웹 서버의 포트입니다.
- `isDevMode` `true`로 지정하면 개발 모드가 활성화됩니다. 개발 모드에서는 이미지 등의 리소스를 캐싱하지 않습니다.
- `rootPath` `.nsp` 파일 혹은 리소스 등이 저장된 경로를 지정합니다.
- `uploadURI` 업로드 처리를 할 `URI`를 입력합니다.
- `maxUploadFileMB` 최대 업로드 가능한 용량을 MB 단위로 입력합니다.
- `uploadPath` 업로드한 파일이 저장될 경로를 입력합니다.
- `restURI` `REST URI` 디자인을 적용할 `URI`를 입력합니다.
- `isNotUsingDCBN` `true`인 경우 이중 중괄호 표기법 `{{`, `}}`을 사용하지 않습니다.
- `isNotUsingCPUClustering` `true`인 경우 멀티코어 CPU를 지원하지 않고, 싱글코어 모드로 실행됩니다.

### UPPERCASE 기반 프로젝트
1. 프로젝트의 `DEPENDENCY` 파일에 `Hanul/NSP`를 추가합니다.
2. [`ubm`](https://www.npmjs.com/package/ubm)을 이용해 설치합니다.
    ```
    ubm install
    ```
3. `NODE/MAIN.js`의 `MAIN` 함수에 다음 내용을 추가합니다.
	```javascript
	addRequestListener(NSP_BRIDGE({
		rootPath : './'
		restURI : 'examples/restful'
	}).requestListener);
	```
	
	- `rootPath` `.nsp` 파일 혹은 리소스 등이 저장된 경로를 지정합니다.
	- `restURI` `REST URI` 디자인을 적용할 `URI`를 입력합니다.
	- `isNotUsingDCBN` `true`인 경우 이중 중괄호 표기법 `{{`, `}}`을 사용하지 않습니다.
	- `preprocessor` NSP 코드가 모두 해석된 후, 해석된 코드를 실행하기 전에 가공할 프리프로세서를 정의합니다.
	- `templateEngine` NSP 코드가 모두 해석된 이후에 실행될 템플릿 엔진을 정의합니다.

## NSP 서버 실행
```
node NSP-server.js
```
이제 `http://localhost:8123`이나 `http://localhost:8123/index.nsp` 혹은 `http://localhost:8123/index`로 접속해보세요. `.nsp` 확장자를 생략할 수 있습니다.

## 코드 예제
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>My first NSP page</h1>
		<%
			var msg = 'Hello World!';
		%>
		<p>{{msg}}</p>
	</body>
</html>
```

## 문법
### `<%`, `%>`
서버 측 JavaScript 코드를 삽입할 수 있습니다.

### `{{`, `}}`, `<%=`, `%>`
`{{expression}}` 혹은 `<%=expression %>`과 같은 형식으로 페이지에 출력할 변수를 지정할 수 있습니다. 이는 `<% print(expression); %>`와 동일한 역할을 수행합니다.

### `<? expression>`, `</?>`, `<? else>`
`expression`에 들어갈 표현식이 `true`일 때만 내용을 해석합니다. `<? else>`는 바로 위의 `expression`이 `false`일 때만 내용을 해석합니다.
```nsp
<%
    var a = true, b = false;
%>
<? a>
    출력됩니다.
</?>
<? b>
    출력되지 않습니다.
</?>
<? else>
    출력됩니다.
</?>
```

### `<~ array -> value>`, `</~>`
배열의 값들을 각각 불러와 반복합니다.
```nsp
<%
    var arr = [1, 2];
%>
<~ arr -> v>
    {{v}}
</~>
```

### `<~ data -> value>`, `<~ data -> name: value>`, `</~>`
객체의 멤버들을 각각 불러와 반복합니다.
```nsp
<%
    var data = {
        a : 1,
        b : 2
    };
%>
<~ data -> n: v>
    {{n}} : {{v}}
</~>
```

### `<~ number -> i>`, `</~>`
```nsp
<~ 5 -> i>
    {{i}}
</~>
```

## 내장 함수
### print
`print`를 사용하여 `HTML` 문서에 내용을 추가합니다.
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>My first NSP page</h1>
		<%
			print('Hello World!');
		%>
	</body>
</html>
```
결과
```html

<!DOCTYPE html>
<html>
	<body>
		<h1>My first NSP page</h1>
		Hello World!
	</body>
</html>
```

JSON 객체도 출력할 수 있습니다. 이를 통해 JSON 기반 API를 만들 수 있습니다.
```nsp
<%
	var data = {
		a : 1,
		b : 2,
		c : 3
	};
	
	print(data); // or {{data}}
%>
```
결과
```json
{"a":1,"b":2,"c":3}
```

### include
`include` 함수로 다른 `.nsp` 파일을 포함할 수 있습니다.
- `var` 키워드로 변수를 등록한 경우, 해당 페이지에서만 변수를 사용할 수 있습니다.
- `include` 등으로 여러 페이지에서 변수를 공유하는 경우에는, 현재 요청에서 해석중인 페이지들이 공유하는 `self` 객체에 값을 대입하여 사용할 수 있습니다.

`include.nsp`
```nsp
<!DOCTYPE html>
<html>
	<body>
		<% include('include/top.nsp'); %>
		<h1>My first NSP page</h1>
		<% include('include/bottom.nsp'); %>
	</body>
</html>
```

`include/top.nsp`
```nsp
<%
	var local = 'Welcome!';
	
	self.msg = 'Hello World! ' + local;
%>
```

`include/bottom.nsp`
```nsp
<p>{{self.msg}}</p>
```

`include` 함수의 두번째 파라미터에 함수를 넣으면, 포함할 파일의 내용을 불러온 이후에 처리할 로직을 작성할 수 있습니다. `include` 함수가 포함된 구문이 끝날 때 까지는 파일 내용을 불러오지 않음에 유의하시기 바랍니다.

```nsp
<!DOCTYPE html>
<html>
	<body>
		<%
    		include('include/top.nsp', function() {
    		    console.log(self.msg); // Hello World! Welcome!
    		});
    		
    		console.log(self.msg); // undefined
		%>
		<%
		    console.log(self.msg); // Hello World! Welcome!
		%>
	</body>
</html>
```

`.js` 파일 또한 포함할 수 있어, 하나의 `.js` 파일을 서버 측과 클라이언트 측에서 동시에 사용하는 등의 개발이 가능합니다.

```nsp
<!DOCTYPE html>
<html>
	<body>
		<% include('include/common.js'); %>
		<script src="include/common.js"></script>
	</body>
</html>
```

### pause/resume
데이터베이스 등을 조작하다 `callback` 처리로 들어갈 경우 `pause` 함수로 문서 해석을 잠시 중단할 수 있습니다. `resume` 함수로 문서 해석을 다시 진행할 수 있습니다.
```nsp
start
<%
	setTimeout(function() {
	
		print('ok');
		
		resume();
	}, 1000);
	
	pause();
%>
end
```

### cookie
쿠키를 저장하거나 가져올 수 있는 함수입니다.
```nsp
<%
	// 쿠키를 지정합니다.
	cookie('sample-cookie', 'this is example.');
	cookie('sample-cookie', '', 0); // 쿠키 제거
	cookie('sample-cookie', 'this is example.', 10); // 10초 후 삭제
	cookie('sample-cookie', 'this is example.', 10, '/'); // path를 /로 지정
	cookie('sample-cookie', 'this is example.', 10, '/', 'www.example'); // domain을 www.example로 지정
	
	// 쿠키를 가져옵니다.
	cookie('sample-cookie');
%>
```

#### `cookie`를 이용한 세션 예제
`cookie` 및 `SHARED_STORE` 클래스를 이용해 세션을 구현하는 예제입니다.
```nsp
<%
	var sessionKey = cookie('session-key');
	
	print(sessionKey);
	
	if (sessionKey === undefined) {
		sessionKey = RANDOM_STR(20);
	}
	
	cookie('session-key', sessionKey, 3600);
	
	var savedData;
	sessionStore.get(sessionKey, {
		notExists : resume,
		success : function(_savedData) {
			savedData = _savedData;
			resume();
		}
	});
	
	pause();
%>
<p>{{savedData}}</p>
<%
	sessionStore.save({
		id : sessionKey,
		data : {
			name : 'YJ Sim',
			age : 30
		}
	});
%>
```
이를 발전시켜 세션 정보를 파일 혹은 데이터베이스에 저장하는 등의 방법을 사용할 수 있습니다.

### redirect
입력한 URL로 redirect합니다.
```nsp
<%
    redirect('/main.nsp');
%>
```
```nsp
<%
    redirect('https://github.com/Hanul/NSP');
%>
```

## escape
`<%`나 `{{` 앞에 역슬래시(\\)를 붙히면 해당 구문은 해석하지 않습니다. 또한 `<%` 나 `{{` 앞에 역슬래시를 두개(\\\\) 붙히면 하나의 역슬래시로 판단하고, 코드 구문을 해석합니다.
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>My first NSP page</h1>
		
		\<%
			// 이 구문을 해석하지 않음
			var msg = 'Hello World!';
		%>
		\{{msg}}
		
		\\<%
			// 이 구문은 해석됨
			var msg = 'Hello World!';
		%>
		\\{{msg}}
	</body>
</html>
```

## 내장 변수
### self.headers
요청 HTTP 헤더 정보를 갖고 있습니다.

### self.method
요청 HTTP Method 정보를 갖고 있습니다. `ex) GET, POST`

### self.ip
요청자의 IP를 문자열 형태로 갖고 있습니다. `ex) 127.0.0.1`

### self.params
HTML `form` 등에서 넘어온 데이터를 갖고 있습니다.

`params.nsp`
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>Params Example</h1>
		<form action="params_result.nsp" method="POST">
			First name: <input type="text" name="fname"><br>
			Last name: <input type="text" name="lname"><br>
			<input type="submit" value="Submit">
		</form>
	</body>
</html>
```

`params_result.nsp`
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>Params Example</h1>
		<p>
			{{self.params}}
		</p>
		<a href="params.nsp">Back</a>
	</body>
</html>
```

`fname`을 `Sam`, `lname`을 `Ple`로 지정하면 `self.params`는 `{"fname":"Sam","lname":"Ple"}`가 됩니다.

### self.subURI
`restURI`에서 지정한 `URI`로 시작하는 `URI`에 접속하였을 때, `restURI`에서 지정한 `URI`를 제외하고 남은 `URI`입니다.
만약 `restURI`가 `sample`이고 접속 `URI`가 `sample/1/edit`이면, `self.subURI`는 `1/edit`이 됩니다.

## 샘플
- RESTful - https://github.com/Hanul/nsp-sample-restful
- BBS (+ MongoDB) - https://github.com/Hanul/nsp-sample-bbs
- BBS (+ MySQL) - https://github.com/Hanul/nsp-sample-bbs-mysql
- BBS (+ AngularJS) - https://github.com/Hanul/nsp-sample-bbs-angularjs

## 기타
### PHP에 익숙한 개발자세요?
[php.js](https://github.com/kvz/phpjs)를 설치하여 NSP와 함께 사용해보세요.
```nsp
<!DOCTYPE html>
<html>
	<body>
		<h1>NSP + php.js</h1>
		<%
			var php = require('phpjs');
			
			print(php.sprintf('Hey, %s : )', 'you'));
			print(php.parse_url('mysql://kevin:abcd1234@example.com/databasename')['pass']);
			print(php.strtotime('2 januari 2012, 11:12:13 GMT'));
		%>
	</body>
</html>
```

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)

## 문의하기
* [GitHub Issues](https://github.com/Hanul/NSP/issues)
* [페이스북 유저 그룹](https://www.facebook.com/groups/nodeserverpages/)