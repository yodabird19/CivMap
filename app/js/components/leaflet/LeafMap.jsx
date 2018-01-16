import React from 'react'
import { connect } from 'react-redux'
import * as L from 'leaflet'
import * as RL from 'react-leaflet'
import 'leaflet-editable'

import LeafBaseMap from './LeafBaseMap'
import LeafOverlay from './LeafOverlay'

import { setViewport } from '../../store'
import { boundsToContainedCircle, circleToBounds } from '../../utils/Math'

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.1.0/images/';

var mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
})

class LeafMap extends React.Component {
  componentWillReceiveProps(newProps) {
    const { viewport } = newProps
    if (viewport !== this.props.viewport) {
      this.checkAndSetView(viewport)
    }
    if (viewport === this.waitingForView) {
      this.waitingForView = null
    }
  }

  checkAndSetView(view) {
    if (!this.map) return
    if (!view) return
    if (!this.waitingForView) {
      this.map.fitBounds(circleToBounds(view), { animate: false })
    }
  }

  onRef(ref) {
    if (!ref) return
    const map = ref.leafletElement
    map.invalidateSize()
    if (this.map === map) return
    this.map = map
    // TODO how to display mouse pos
    this.checkAndSetView(this.props.viewport)
  }

  onViewChange(e) {
    const newView = boundsToContainedCircle(e.target.getBounds())
    this.waitingForView = newView
    this.props.setViewport(newView)
  }

  render() {
    const {
      mapBgColor,
    } = this.props

    return <div className="mapContainer"
      style={{ backgroundColor: mapBgColor }}
    >
      <RL.Map
        className="map"
        ref={this.onRef.bind(this)}
        crs={mcCRS}
        center={[0, 0]}
        zoom={-6}
        maxZoom={5}
        minZoom={-6}
        attributionControl={false}
        zoomControl={false}
        onmove={this.onViewChange.bind(this)}
        onzoomend={this.onViewChange.bind(this)}
        editable
      >
        <LeafBaseMap />
        <LeafOverlay />
      </RL.Map>
    </div>
  }
}

const mapStateToProps = ({ control, mapConfig, mapView }, ownProps) => {
  return {
    mapBgColor: mapConfig.basemaps[mapView.basemapId].bgColor,
    viewport: mapView.viewport,
    _windowWidth: control.windowWidth, // dummy, only to trigger a re-render
    _appMode: control.appMode, // dummy, only to trigger a re-render
  }
}

const mapDispatchToProps = {
  setViewport,
}

export default connect(mapStateToProps, mapDispatchToProps)(LeafMap)
