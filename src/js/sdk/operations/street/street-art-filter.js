/*
 * Photo Editor SDK - photoeditorsdk.com
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

// import Utils from '../../lib/utils'
import Filter from '../filters/filter'

/**
 * Gray Filter
 * @class
 * @alias PhotoEditorSDK.Art.StreetArtFilter
 * @extends {PhotoEditorSDK.Filter}
 */
class StreetArtFilter extends Filter {
  constructor (...args) {
    super(...args)
    this._glslPrograms = {}
    this._textures = {}
    this._framebuffer = null
    this._fbosAvailable = false

    this._vertexShader = require('raw!../generic/default.vert')
    this._fragmentShader = this._blurShader = require('raw!./street-art.frag')
  }

  /**
   * Renders the opertaion (WebGL)
   * @param  {WebGLRenderer} renderer
   * @param  {WebGLTexture} inputTexture
   * @param  {WebGLFramebuffer} outputFBO
   * @param  {WebGLTexture} outputTexture
   * @return {Promise}
   */
  /* istanbul ignore next */
  renderWebGL (renderer, inputTexture, outputFBO, outputTexture) {
    return this._uploadTexture(renderer)
      .then((texture) => {
        if (!this._glslPrograms[renderer.id]) {
          this._glslPrograms[renderer.id] = renderer.setupGLSLProgram(
            null,
            this._fragmentShader
          )
        }
        const gl = renderer.getContext()
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.activeTexture(gl.TEXTURE0)

        renderer.runProgram(this._glslPrograms[renderer.id], {
          uniforms: {
            intensity: { type: 'f', value: this._intensity },
            artTexture: { type: 'i', value: 1 }
          }
        })
      })
  }

  /**
   * Uploads the given image to a texture
   * @param  {WebGLRenderer} renderer
   * @return {Promise}
   * @private
   */
  _uploadTexture (renderer) {
    return new Promise((resolve, reject) => {
      // Use cached texture
      if (this._textures[renderer.id]) {
        return resolve(this._textures[renderer.id])
      }

      const image = new window.Image()
      image.addEventListener('load', () => {
        const texture = renderer.createTexture(image)
        this._textures[renderer.id] = texture
        resolve(texture)
      })

      image.crossOrigin = 'Anonymous'
      image.src = '/build/assets/art/grunge1.jpg'
    })
  }

  /**
  * Renders the gray operation to a canvas
  * @param  {CanvasRenderer} renderer
  * @private
  */
  renderCanvas (renderer) {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  /**
   * Renders the stack of primitives on the renderer
   * @param  {Renderer} renderer
   */
  render (renderer) {
    console.log(renderer.identifier)
    if (renderer.identifier === 'webgl') {
      return this.renderWebGL(renderer)
    } else {
      return this.renderCanvas(renderer)
    }
  }

  /**
   * A unique string that identifies this operation. Can be used to select
   * the active filter.
   * @type {String}
   */
  static get identifier () {
    return 'street'
  }

  /**
   * The name that is displayed in the UI
   * @type {String}
   */
  get name () {
    return 'StreetArt'
  }
}

export default StreetArtFilter