<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - The Circle Workspace</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            margin: 0;
            padding: 40px;
            background-color: #f9f9f9;
          }
          #content {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          h1 {
            color: #00674F;
            font-size: 24px;
            margin-top: 0;
          }
          p {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th {
            background-color: #f4f4f4;
            color: #333;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #ddd;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          tr:hover td {
            background-color: #fafafa;
          }
          a {
            color: #00674F;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .url-count {
            display: inline-block;
            background: #E8F3F0;
            color: #00674F;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div id="content">
          <h1>XML Sitemap</h1>
          <p>This is an XML Sitemap, meant for consumption by search engines like Google or Bing.<br/>You can find more information about XML sitemaps on <a href="http://sitemaps.org" target="_blank">sitemaps.org</a>.</p>
          <p>This sitemap contains <span class="url-count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span> URLs.</p>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
