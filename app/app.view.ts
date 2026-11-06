namespace $.$$ {

	export class $bog_brelok_app extends $.$bog_brelok_app {

		open_sub() {
			return [ this.Open().Icon(), this.Open().Native(), this.Open_label() ]
		}

		@ $mol_mem
		files( next?: readonly File[] ) {
			if( next ) this.custom( null )
			return next ?? []
		}

		@ $mol_mem
		picture() {
			const file = this.files()[ 0 ]
			if( !file ) return null
			return this.$.$mol_picture.fit( file, 900 )
		}

		@ $mol_mem
		pivot() {
			const picture = this.picture()
			if( !picture ) return null
			const bitmap = picture.bitmap
			return this.$.$bog_brelok_pivot.from_rgba( bitmap.data, bitmap.width, bitmap.height, this.tolerance() )
		}

		size_preset( next?: string ) {
			if( next !== undefined ) this.size( Number( next ) )
			return String( this.size() )
		}

		@ $mol_mem
		scale() {
			const bounds = this.pivot()?.bounds()
			if( !bounds ) return 0
			return Math.max( bounds.width, bounds.height ) / ( this.size() * 10 )
		}

		@ $mol_mem
		custom( next?: $bog_brelok_pivot_point | null ) {
			return next ?? null
		}

		custom_used() {
			return Boolean( this.custom() )
		}

		reset() {
			this.custom( null )
		}

		@ $mol_mem
		auto_point() {
			const inset = ( this.offset() + this.hole() / 2 ) * this.scale()
			return this.pivot()?.hole( this.angle(), inset ) ?? null
		}

		point() {
			return this.custom() ?? this.auto_point()
		}

		@ $mol_mem
		skew() {
			const point = this.point()
			if( !point ) return 0
			const skew = this.pivot()!.tilt( point ) + this.angle()
			return ( ( skew + 540 ) % 360 ) - 180
		}

		mm( point: $bog_brelok_pivot_point ) {
			const bounds = this.pivot()!.bounds()!
			const scale = this.scale()
			return {
				x: ( point.x - bounds.left ) / scale,
				y: ( point.y - bounds.top ) / scale,
			}
		}

		@ $mol_mem
		result_text() {

			const pivot = this.pivot()
			if( !pivot ) return super.result_text()

			const bounds = pivot.bounds()
			const auto = this.auto_point()
			if( !bounds || !auto ) return 'Не вижу брелок на картинке. Попробуйте поменять чувствительность к фону.'

			const fmt = ( val: number ) => val.toFixed( 1 ).replace( '.', ',' )
			const size = `Брелок ${ fmt( bounds.width / this.scale() ) } × ${ fmt( bounds.height / this.scale() ) } мм.`
			const place = ( point: $bog_brelok_pivot_point ) => {
				const mm = this.mm( point )
				return `${ fmt( mm.x ) } мм от левого края и ${ fmt( mm.y ) } мм от верхнего`
			}

			const radius = this.hole() / 2 * this.scale()
			const warn = pivot.covers( auto, radius ) ? '' : ' Отверстие вылезает за край: увеличьте отступ или поменяйте наклон.'

			const custom = this.custom()
			if( !custom ) return `Центр отверстия: ${ place( auto ) }. ${ size }${ warn }`

			const skew = Math.round( Math.abs( this.skew() ) )
			const verdict = skew < 2 ? 'висит ровно' : `перекосится на ${ skew }°`
			return `В вашей точке (${ place( custom ) }) брелок ${ verdict }. Ровно будет тут: ${ place( auto ) }. ${ size }`
		}

		@ $mol_mem
		back_mask() {

			const pivot = this.pivot()
			if( !pivot ) return null

			const canvas = this.$.$mol_dom_context.document.createElement( 'canvas' )
			canvas.width = pivot.width
			canvas.height = pivot.height

			const context = canvas.getContext( '2d' )!
			const image = context.createImageData( pivot.width, pivot.height )

			for( let index = 0; index < pivot.mask.length; ++ index ) {
				if( pivot.mask[ index ] ) continue
				image.data.set( [ 120, 120, 140, 110 ], index * 4 )
			}

			context.putImageData( image, 0, 0 )
			return canvas
		}

		@ $mol_mem
		cut() {

			const picture = this.picture()
			const pivot = this.pivot()
			if( !picture || !pivot ) return null

			const canvas = this.$.$mol_dom_context.document.createElement( 'canvas' )
			canvas.width = pivot.width
			canvas.height = pivot.height

			const context = canvas.getContext( '2d' )!
			const image = picture.bitmap

			for( let index = 0; index < pivot.mask.length; ++ index ) {
				if( !pivot.mask[ index ] ) image.data[ index * 4 + 3 ] = 0
			}

			context.putImageData( image, 0, 0 )
			return canvas
		}

		@ $mol_mem
		scheme_layout() {
			const pivot = this.pivot()
			if( !pivot ) return null
			const width = this.Scheme().width()
			const height = this.Scheme().height()
			const zoom = Math.min( width / pivot.width, height / pivot.height ) * .92
			return {
				zoom,
				left: ( width - pivot.width * zoom ) / 2,
				top: ( height - pivot.height * zoom ) / 2,
			}
		}

		scheme_paint() {

			const canvas = this.Scheme()
			const context = canvas.context()
			context.clearRect( 0, 0, canvas.width(), canvas.height() )

			const picture = this.picture()
			const pivot = this.pivot()
			const layout = this.scheme_layout()
			if( !picture || !pivot || !layout ) return null

			const dpr = this.$.$mol_dom_context.devicePixelRatio
			const { zoom, left, top } = layout

			context.save()
			context.translate( left, top )
			context.scale( zoom, zoom )
			context.drawImage( picture.canvas, 0, 0, pivot.width, pivot.height )
			context.drawImage( this.back_mask()!, 0, 0 )
			context.restore()

			const at = ( point: $bog_brelok_pivot_point ) => ( { x: left + point.x * zoom, y: top + point.y * zoom } )

			const center = pivot.center()
			if( !center ) return null

			const dir = $bog_brelok_pivot.direction( this.angle() )
			const reach = Math.hypot( canvas.width(), canvas.height() )
			const mid = at( center )

			context.save()
			context.setLineDash( [ 6 * dpr, 6 * dpr ] )
			context.lineWidth = 1.5 * dpr
			context.strokeStyle = '#2b7de9'
			context.beginPath()
			context.moveTo( mid.x - dir.x * reach, mid.y - dir.y * reach )
			context.lineTo( mid.x + dir.x * reach, mid.y + dir.y * reach )
			context.stroke()
			context.restore()

			this.cross( context, mid, 7 * dpr, '#2b7de9' )

			const radius = Math.max( this.hole() / 2 * this.scale() * zoom, 3 * dpr )
			const auto = this.auto_point()
			const custom = this.custom()

			if( auto ) this.ring( context, at( auto ), radius, '#18a058', custom ? .45 : 1 )
			if( custom ) this.ring( context, at( custom ), radius, Math.abs( this.skew() ) < 2 ? '#18a058' : '#e8590c', 1 )

			return null
		}

		cross( context: CanvasRenderingContext2D, point: $bog_brelok_pivot_point, size: number, color: string ) {
			context.save()
			context.strokeStyle = color
			context.lineWidth = size / 3
			context.beginPath()
			context.moveTo( point.x - size, point.y )
			context.lineTo( point.x + size, point.y )
			context.moveTo( point.x, point.y - size )
			context.lineTo( point.x, point.y + size )
			context.stroke()
			context.restore()
		}

		ring( context: CanvasRenderingContext2D, point: $bog_brelok_pivot_point, radius: number, color: string, alpha: number ) {
			const dpr = this.$.$mol_dom_context.devicePixelRatio
			context.save()
			context.globalAlpha = alpha
			context.fillStyle = 'rgba(255,255,255,.85)'
			context.strokeStyle = color
			context.lineWidth = 2.5 * dpr
			context.beginPath()
			context.arc( point.x, point.y, radius, 0, Math.PI * 2 )
			context.fill()
			context.stroke()
			context.restore()
		}

		scheme_pick( event?: PointerEvent ) {

			const layout = this.scheme_layout()
			if( !event || !layout ) return null

			const dpr = this.$.$mol_dom_context.devicePixelRatio
			this.custom( {
				x: ( event.offsetX * dpr - layout.left ) / layout.zoom,
				y: ( event.offsetY * dpr - layout.top ) / layout.zoom,
			} )

			return null
		}

		hang_paint() {

			const canvas = this.Hang()
			const context = canvas.context()
			const width = canvas.width()
			const height = canvas.height()
			context.clearRect( 0, 0, width, height )

			const picture = this.picture()
			const pivot = this.pivot()
			const point = this.point()
			const bounds = pivot?.bounds()
			const center = pivot?.center()
			if( !picture || !pivot || !point || !bounds || !center ) return null

			const dpr = this.$.$mol_dom_context.devicePixelRatio
			const tilt = pivot.tilt( point ) * Math.PI / 180
			const cos = Math.cos( tilt )
			const sin = Math.sin( tilt )

			const corners = [ [ bounds.left, bounds.top ], [ bounds.right, bounds.top ], [ bounds.left, bounds.bottom ], [ bounds.right, bounds.bottom ] ]
				.map( ( [ x, y ] ) => [ x - point.x, y - point.y ] )
				.map( ( [ x, y ] ) => ( { x: x * cos - y * sin, y: x * sin + y * cos } ) )

			const half = Math.max( ... corners.map( corner => Math.abs( corner.x ) ) )
			const rise = Math.max( 0, ... corners.map( corner => - corner.y ) )
			const fall = Math.max( 0, ... corners.map( corner => corner.y ) )

			const chain = 40 * dpr
			const zoom = Math.min( width / 2 / half, ( height - chain ) / ( rise + fall ) ) * .92
			const top = chain + rise * zoom

			context.save()
			context.setLineDash( [ 6 * dpr, 6 * dpr ] )
			context.lineWidth = 1.5 * dpr
			context.strokeStyle = '#2b7de9'
			context.beginPath()
			context.moveTo( width / 2, top )
			context.lineTo( width / 2, height )
			context.stroke()
			context.restore()

			context.save()
			context.translate( width / 2, top )
			context.rotate( tilt )
			context.scale( zoom, zoom )
			context.translate( - point.x, - point.y )
			context.drawImage( this.cut()!, 0, 0 )
			context.restore()

			context.save()
			context.strokeStyle = '#888'
			context.lineWidth = 2 * dpr
			context.beginPath()
			context.moveTo( width / 2, 0 )
			context.lineTo( width / 2, top - 8 * dpr )
			context.stroke()
			context.restore()

			const radius = Math.max( this.hole() / 2 * this.scale() * zoom, 3 * dpr )
			this.ring( context, { x: width / 2, y: top }, radius, '#888', 1 )

			return null
		}

	}

}
