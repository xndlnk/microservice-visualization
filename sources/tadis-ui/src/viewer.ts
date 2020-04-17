import 'tachyons/css/tachyons.css'
import './html/style.css'

import(/* webpackChunkName: "SystemViewer" */ './SystemViewer').then(SystemViewer => {
  SystemViewer.load()
})
