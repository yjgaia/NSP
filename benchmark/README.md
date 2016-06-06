# PHP 7.0.7 vs NSP 2.0

###### NSP's config.json
```json
{
	"port": 8123,
	"rootPath": "./www",
	"uploadURI": ["examples/upload_result.nsp"],
	"restURI" : ["examples/restful"]
}
```

## hello.php vs hello.nsp
###### hello.php
```
ab -n 10000 -c 100 http://localhost/php-examples/hello.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/hello.php
Document Length:        153 bytes

Concurrency Level:      100
Time taken for tests:   4.185 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3550000 bytes
HTML transferred:       1530000 bytes
Requests per second:    2389.23 [#/sec] (mean)
Time per request:       41.855 [ms] (mean)
Time per request:       0.419 [ms] (mean, across all concurrent requests)
Transfer rate:          828.30 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       6
Processing:    24   41   4.1     41      74
Waiting:        9   41   4.4     41      74
Total:         24   41   4.1     41      74

Percentage of the requests served within a certain time (ms)
  50%     41
  66%     42
  75%     42
  80%     43
  90%     46
  95%     49
  98%     54
  99%     58
 100%     74 (longest request)
```
###### hello.nsp
```
ab -n 10000 -c 100 http://localhost:8123/examples/hello.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/hello.nsp
Document Length:        146 bytes

Concurrency Level:      100
Time taken for tests:   3.714 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2610000 bytes
HTML transferred:       1460000 bytes
Requests per second:    2692.78 [#/sec] (mean)
Time per request:       37.136 [ms] (mean)
Time per request:       0.371 [ms] (mean, across all concurrent requests)
Transfer rate:          686.34 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     2   37   8.3     33      97
Waiting:        2   36   8.3     33      97
Total:          3   37   8.3     34      97

Percentage of the requests served within a certain time (ms)
  50%     34
  66%     37
  75%     40
  80%     43
  90%     47
  95%     53
  98%     61
  99%     73
 100%     97 (longest request)
```

## json.php vs json.nsp
###### json.php
```
ab -n 10000 -c 100 http://localhost/php-examples/json.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/json.php
Document Length:        19 bytes

Concurrency Level:      100
Time taken for tests:   3.988 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2200000 bytes
HTML transferred:       190000 bytes
Requests per second:    2507.32 [#/sec] (mean)
Time per request:       39.883 [ms] (mean)
Time per request:       0.399 [ms] (mean, across all concurrent requests)
Transfer rate:          538.68 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       3
Processing:    22   39   4.2     38      93
Waiting:       13   39   4.4     38      93
Total:         22   40   4.2     39      93

Percentage of the requests served within a certain time (ms)
  50%     39
  66%     39
  75%     40
  80%     41
  90%     44
  95%     49
  98%     52
  99%     54
 100%     93 (longest request)
```
###### json.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/json.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/json.nsp
Document Length:        19 bytes

Concurrency Level:      100
Time taken for tests:   3.490 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1340000 bytes
HTML transferred:       190000 bytes
Requests per second:    2865.36 [#/sec] (mean)
Time per request:       34.900 [ms] (mean)
Time per request:       0.349 [ms] (mean, across all concurrent requests)
Transfer rate:          374.96 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       2
Processing:     2   34   4.7     33      60
Waiting:        2   34   5.1     33      59
Total:          2   35   4.7     33      60

Percentage of the requests served within a certain time (ms)
  50%     33
  66%     35
  75%     36
  80%     38
  90%     42
  95%     44
  98%     47
  99%     48
 100%     60 (longest request)
```

## conditional.php vs conditional.nsp
###### conditional.php
```
ab -n 10000 -c 100 http://localhost/php-examples/conditional.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/conditional.php
Document Length:        169 bytes

Concurrency Level:      100
Time taken for tests:   3.892 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3710000 bytes
HTML transferred:       1690000 bytes
Requests per second:    2569.53 [#/sec] (mean)
Time per request:       38.918 [ms] (mean)
Time per request:       0.389 [ms] (mean, across all concurrent requests)
Transfer rate:          930.95 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       4
Processing:    18   38   4.4     38      74
Waiting:       12   38   4.4     38      74
Total:         18   39   4.4     38      74

Percentage of the requests served within a certain time (ms)
  50%     38
  66%     39
  75%     39
  80%     40
  90%     42
  95%     47
  98%     54
  99%     56
 100%     74 (longest request)
```
###### conditional.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/conditional.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/conditional.nsp
Document Length:        169 bytes

Concurrency Level:      100
Time taken for tests:   3.511 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2840000 bytes
HTML transferred:       1690000 bytes
Requests per second:    2848.20 [#/sec] (mean)
Time per request:       35.110 [ms] (mean)
Time per request:       0.351 [ms] (mean, across all concurrent requests)
Transfer rate:          789.93 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       6
Processing:     2   34   3.9     34      53
Waiting:        1   34   4.0     33      53
Total:          2   35   3.9     34      54

Percentage of the requests served within a certain time (ms)
  50%     34
  66%     35
  75%     36
  80%     37
  90%     40
  95%     44
  98%     47
  99%     48
 100%     54 (longest request)
```

## each.php vs each.nsp
###### each.php
```
ab -n 10000 -c 100 http://localhost/php-examples/each.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/each.php
Document Length:        232 bytes

Concurrency Level:      100
Time taken for tests:   4.426 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      4340000 bytes
HTML transferred:       2320000 bytes
Requests per second:    2259.34 [#/sec] (mean)
Time per request:       44.261 [ms] (mean)
Time per request:       0.443 [ms] (mean, across all concurrent requests)
Transfer rate:          957.57 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0      16
Processing:    20   44   4.3     43      78
Waiting:       19   43   4.3     43      77
Total:         20   44   4.3     43      78

Percentage of the requests served within a certain time (ms)
  50%     43
  66%     44
  75%     45
  80%     46
  90%     48
  95%     51
  98%     57
  99%     61
 100%     78 (longest request)
```
###### each.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/each.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/each.nsp
Document Length:        251 bytes

Concurrency Level:      100
Time taken for tests:   3.922 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3660000 bytes
HTML transferred:       2510000 bytes
Requests per second:    2549.87 [#/sec] (mean)
Time per request:       39.218 [ms] (mean)
Time per request:       0.392 [ms] (mean, across all concurrent requests)
Transfer rate:          911.38 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       4
Processing:     3   39   4.7     37      61
Waiting:        3   38   4.7     37      61
Total:          3   39   4.7     37      61

Percentage of the requests served within a certain time (ms)
  50%     37
  66%     39
  75%     40
  80%     42
  90%     47
  95%     49
  98%     51
  99%     53
 100%     61 (longest request)
```

## headers.php vs headers.nsp
###### headers.php
```
ab -n 10000 -c 100 http://localhost/php-examples/headers.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/headers.php
Document Length:        170 bytes

Concurrency Level:      100
Time taken for tests:   4.161 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3720000 bytes
HTML transferred:       1700000 bytes
Requests per second:    2403.30 [#/sec] (mean)
Time per request:       41.609 [ms] (mean)
Time per request:       0.416 [ms] (mean, across all concurrent requests)
Transfer rate:          873.08 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       3
Processing:    18   41   3.5     41      76
Waiting:       14   41   3.6     41      76
Total:         18   41   3.5     41      76

Percentage of the requests served within a certain time (ms)
  50%     41
  66%     42
  75%     42
  80%     42
  90%     44
  95%     47
  98%     53
  99%     55
 100%     76 (longest request)
```
###### headers.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/headers.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/headers.nsp
Document Length:        178 bytes

Concurrency Level:      100
Time taken for tests:   3.378 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2930000 bytes
HTML transferred:       1780000 bytes
Requests per second:    2959.98 [#/sec] (mean)
Time per request:       33.784 [ms] (mean)
Time per request:       0.338 [ms] (mean, across all concurrent requests)
Transfer rate:          846.95 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     2   33   4.6     32      63
Waiting:        2   33   4.8     32      63
Total:          2   33   4.6     32      63

Percentage of the requests served within a certain time (ms)
  50%     32
  66%     33
  75%     34
  80%     35
  90%     40
  95%     44
  98%     47
  99%     52
 100%     63 (longest request)
```

## ip.php vs ip.nsp
###### ip.php
```
ab -n 10000 -c 100 http://localhost/php-examples/ip.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/ip.php
Document Length:        118 bytes

Concurrency Level:      100
Time taken for tests:   3.956 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3200000 bytes
HTML transferred:       1180000 bytes
Requests per second:    2527.72 [#/sec] (mean)
Time per request:       39.561 [ms] (mean)
Time per request:       0.396 [ms] (mean, across all concurrent requests)
Transfer rate:          789.91 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0      16
Processing:    18   39   4.5     39      69
Waiting:       15   38   4.5     38      68
Total:         18   39   4.5     39      69

Percentage of the requests served within a certain time (ms)
  50%     39
  66%     40
  75%     40
  80%     41
  90%     44
  95%     48
  98%     55
  99%     57
 100%     69 (longest request)
```
###### ip.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/ip.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/ip.nsp
Document Length:        118 bytes

Concurrency Level:      100
Time taken for tests:   3.316 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2330000 bytes
HTML transferred:       1180000 bytes
Requests per second:    3015.81 [#/sec] (mean)
Time per request:       33.159 [ms] (mean)
Time per request:       0.332 [ms] (mean, across all concurrent requests)
Transfer rate:          686.22 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     2   33   3.5     32      61
Waiting:        2   32   3.6     32      61
Total:          2   33   3.5     32      62

Percentage of the requests served within a certain time (ms)
  50%     32
  66%     33
  75%     34
  80%     35
  90%     38
  95%     41
  98%     43
  99%     44
 100%     62 (longest request)
```

## cookies.php vs cookies.nsp
###### cookies.php
```
ab -n 10000 -c 100 http://localhost/php-examples/cookies.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/cookies.php
Document Length:        162 bytes

Concurrency Level:      100
Time taken for tests:   4.075 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      4580000 bytes
HTML transferred:       1620000 bytes
Requests per second:    2454.05 [#/sec] (mean)
Time per request:       40.749 [ms] (mean)
Time per request:       0.407 [ms] (mean, across all concurrent requests)
Transfer rate:          1097.61 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       5
Processing:    22   40   4.6     40      77
Waiting:       12   40   4.4     40      71
Total:         22   40   4.6     40      77

Percentage of the requests served within a certain time (ms)
  50%     40
  66%     41
  75%     42
  80%     43
  90%     45
  95%     49
  98%     54
  99%     58
 100%     77 (longest request)
```
###### cookies.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/cookies.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/cookies.nsp
Document Length:        153 bytes

Concurrency Level:      100
Time taken for tests:   3.500 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3550000 bytes
HTML transferred:       1530000 bytes
Requests per second:    2857.16 [#/sec] (mean)
Time per request:       35.000 [ms] (mean)
Time per request:       0.350 [ms] (mean, across all concurrent requests)
Transfer rate:          990.52 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     2   34   4.5     33      59
Waiting:        2   34   4.6     33      59
Total:          2   35   4.5     33      59

Percentage of the requests served within a certain time (ms)
  50%     33
  66%     35
  75%     36
  80%     37
  90%     41
  95%     44
  98%     49
  99%     51
 100%     59 (longest request)
```

## saveload.php vs saveload.nsp
###### saveload.php
```
ab -n 10000 -c 100 http://localhost/php-examples/saveload.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/saveload.php
Document Length:        147 bytes

Concurrency Level:      100
Time taken for tests:   5.065 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3490000 bytes
HTML transferred:       1470000 bytes
Requests per second:    1974.45 [#/sec] (mean)
Time per request:       50.647 [ms] (mean)
Time per request:       0.506 [ms] (mean, across all concurrent requests)
Transfer rate:          672.93 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.7      0      16
Processing:    16   50  14.6     47     109
Waiting:       16   50  14.5     47     109
Total:         16   50  14.6     47     109

Percentage of the requests served within a certain time (ms)
  50%     47
  66%     63
  75%     63
  80%     63
  90%     63
  95%     78
  98%     78
  99%     78
 100%    109 (longest request)
```
###### saveload.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/saveload.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/saveload.nsp
Document Length:        141 bytes

Concurrency Level:      100
Time taken for tests:   4.656 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2560000 bytes
HTML transferred:       1410000 bytes
Requests per second:    2147.62 [#/sec] (mean)
Time per request:       46.563 [ms] (mean)
Time per request:       0.466 [ms] (mean, across all concurrent requests)
Transfer rate:          536.91 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.5      0      16
Processing:    16   46  11.2     47      78
Waiting:       16   46  11.1     47      78
Total:         16   46  11.2     47      78

Percentage of the requests served within a certain time (ms)
  50%     47
  66%     47
  75%     47
  80%     62
  90%     63
  95%     63
  98%     63
  99%     78
 100%     78 (longest request)
```

## include.php vs include.nsp
###### include.php
```
ab -n 10000 -c 100 http://localhost/php-examples/include.php
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Apache/2.4.20
Server Hostname:        localhost
Server Port:            80

Document Path:          /php-examples/include.php
Document Length:        135 bytes

Concurrency Level:      100
Time taken for tests:   8.562 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      3370000 bytes
HTML transferred:       1350000 bytes
Requests per second:    1167.89 [#/sec] (mean)
Time per request:       85.625 [ms] (mean)
Time per request:       0.856 [ms] (mean, across all concurrent requests)
Transfer rate:          384.35 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.8      0      16
Processing:    16   85  21.6     94     188
Waiting:       16   84  21.6     94     172
Total:         16   85  21.6     94     188

Percentage of the requests served within a certain time (ms)
  50%     94
  66%     94
  75%     94
  80%     94
  90%    109
  95%    125
  98%    125
  99%    141
 100%    188 (longest request)
```
###### include.php
```
ab -n 10000 -c 100 http://localhost:8123/examples/include.nsp
```
```
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:
Server Hostname:        localhost
Server Port:            8123

Document Path:          /examples/include.nsp
Document Length:        131 bytes

Concurrency Level:      100
Time taken for tests:   5.109 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      2460000 bytes
HTML transferred:       1310000 bytes
Requests per second:    1957.17 [#/sec] (mean)
Time per request:       51.094 [ms] (mean)
Time per request:       0.511 [ms] (mean, across all concurrent requests)
Transfer rate:          470.18 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.4      0      16
Processing:     0   50  10.0     47     109
Waiting:        0   50  10.0     47     109
Total:          0   51  10.0     47     109

Percentage of the requests served within a certain time (ms)
  50%     47
  66%     47
  75%     62
  80%     63
  90%     63
  95%     63
  98%     78
  99%     78
 100%    109 (longest request)
```