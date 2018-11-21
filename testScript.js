var gr = new GlideRecord("sys_user");
gr.addQuery("user_name", "abel.tuter");
gr.query();
if(gr.next()){
    var result = gr.getValue("sys_id");
}
result;