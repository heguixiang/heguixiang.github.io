function generateTOC(insertBefore, heading, startLv) {
    var container = jQuery("
");
    var div = jQuery("
");
    var content = jQuery(insertBefore).first();
    if (heading !== undefined && heading !== null) {
        container.append('' + heading + '');
    }
    if (startLv === undefined) { startLv = 1; }
    div.tableOfContents(content, { startLevel: startLv });
    container.append(div);
    container.insertBefore(insertBefore);
}