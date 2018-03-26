# kue-manager

Deal with kue jobs in a batch

## Get started

* install

``` bash
npm install kue-manager
```

* config host (**be sure that your kue server is open and hosts deployed**)

``` bash
kue-manager config KUE_HOST ${your_kue_host}
```

* config request interval (default 100ms)

``` bash
kue-manager config REQUEST_INTERVAL 500
```

* delete jobs

``` bash
kue-manager delete --type ${job_type} --end 10
```

## Todos

- [ ] list, l, ls
- [x] check, c