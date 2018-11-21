var fetch = require('node-fetch');


fetch("https://dev69271.service-now.com/sys.scripts.do", {
        "credentials": "include",
        "headers": {},
        "referrer": "https://dev69271.service-now.com/sys.scripts.do",
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": "script=gs.print%28%22hi+there%21%22%29%3B&sysparm_ck=f5ec1e27db012300236c2a9a489619a7b1786c2a401c18f9290c158fd696a99bc61316b0&runscript=Run+script&sys_scope=global&record_for_rollback=on&sandbox=on&quota_managed_transaction=on",
        "method": "POST",
        "mode": "cors"
    }).then(res => res.text())
    .then(body => console.log(body));