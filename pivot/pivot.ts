namespace $ {

	export type $bog_brelok_pivot_point = { x: number, y: number }

	export class $bog_brelok_pivot extends $mol_object2 {

		constructor(
			readonly mask: Uint8Array,
			readonly width: number,
			readonly height: number,
		) {
			super()
		}

		static from_rgba( data: ArrayLike< number >, width: number, height: number, tolerance = 40 ) {

			const size = width * height
			const back = this.border_color( data, width, height )
			const limit = tolerance * tolerance * 3

			const candidate = ( index: number ) => {
				const offset = index * 4
				if( data[ offset + 3 ] < 128 ) return true
				if( !back ) return false
				const r = data[ offset ] - back[ 0 ]
				const g = data[ offset + 1 ] - back[ 1 ]
				const b = data[ offset + 2 ] - back[ 2 ]
				return r * r + g * g + b * b <= limit
			}

			const mask = new Uint8Array( size ).fill( 1 )
			const queue = new Int32Array( size )
			let head = 0
			let tail = 0

			const visit = ( index: number ) => {
				if( !mask[ index ] ) return
				if( !candidate( index ) ) return
				mask[ index ] = 0
				queue[ tail ++ ] = index
			}

			for( let x = 0; x < width; ++ x ) {
				visit( x )
				visit( ( height - 1 ) * width + x )
			}

			for( let y = 0; y < height; ++ y ) {
				visit( y * width )
				visit( y * width + width - 1 )
			}

			while( head < tail ) {
				const index = queue[ head ++ ]
				const x = index % width
				if( x > 0 ) visit( index - 1 )
				if( x < width - 1 ) visit( index + 1 )
				if( index >= width ) visit( index - width )
				if( index < size - width ) visit( index + width )
			}

			for( let index = 0; index < size; ++ index ) {
				if( data[ index * 4 + 3 ] < 128 ) mask[ index ] = 0
			}

			return new this( mask, width, height )
		}

		static border_color( data: ArrayLike< number >, width: number, height: number ) {

			let r = 0
			let g = 0
			let b = 0
			let count = 0

			const take = ( x: number, y: number ) => {
				const offset = ( y * width + x ) * 4
				if( data[ offset + 3 ] < 128 ) return
				r += data[ offset ]
				g += data[ offset + 1 ]
				b += data[ offset + 2 ]
				++ count
			}

			for( let x = 0; x < width; ++ x ) {
				take( x, 0 )
				take( x, height - 1 )
			}

			for( let y = 1; y < height - 1; ++ y ) {
				take( 0, y )
				take( width - 1, y )
			}

			if( !count ) return null
			return [ r / count, g / count, b / count ]
		}

		filled( x: number, y: number ) {
			const col = Math.floor( x )
			const row = Math.floor( y )
			if( col < 0 || row < 0 || col >= this.width || row >= this.height ) return false
			return this.mask[ row * this.width + col ] === 1
		}

		@ $mol_mem
		area() {
			let count = 0
			for( const cell of this.mask ) count += cell
			return count
		}

		@ $mol_mem
		center(): $bog_brelok_pivot_point | null {

			let sum_x = 0
			let sum_y = 0
			let count = 0

			for( let y = 0; y < this.height; ++ y ) {
				for( let x = 0; x < this.width; ++ x ) {
					if( !this.mask[ y * this.width + x ] ) continue
					sum_x += x + .5
					sum_y += y + .5
					++ count
				}
			}

			if( !count ) return null
			return { x: sum_x / count, y: sum_y / count }
		}

		@ $mol_mem
		bounds() {

			let left = this.width
			let top = this.height
			let right = 0
			let bottom = 0

			for( let y = 0; y < this.height; ++ y ) {
				for( let x = 0; x < this.width; ++ x ) {
					if( !this.mask[ y * this.width + x ] ) continue
					if( x < left ) left = x
					if( y < top ) top = y
					if( x + 1 > right ) right = x + 1
					if( y + 1 > bottom ) bottom = y + 1
				}
			}

			if( right <= left ) return null
			return { left, top, right, bottom, width: right - left, height: bottom - top }
		}

		static direction( angle: number ) {
			const rad = angle * Math.PI / 180
			return { x: Math.sin( rad ), y: - Math.cos( rad ) }
		}

		edge( angle = 0 ): $bog_brelok_pivot_point | null {

			const center = this.center()
			if( !center ) return null

			const dir = $bog_brelok_pivot.direction( angle )
			const reach = Math.ceil( Math.hypot( this.width, this.height ) )
			const step = .25

			for( let dist = reach; dist >= 0; dist -= step ) {
				const x = center.x + dir.x * dist
				const y = center.y + dir.y * dist
				if( this.filled( x, y ) ) return { x, y }
			}

			return null
		}

		hole( angle: number, inset: number ): $bog_brelok_pivot_point | null {

			const edge = this.edge( angle )
			if( !edge ) return null

			const dir = $bog_brelok_pivot.direction( angle )
			return { x: edge.x - dir.x * inset, y: edge.y - dir.y * inset }
		}

		covers( point: $bog_brelok_pivot_point, radius: number ) {

			const ring = radius + 1

			for( let step = 0; step < 32; ++ step ) {
				const rad = step * Math.PI / 16
				if( !this.filled( point.x + Math.cos( rad ) * ring, point.y + Math.sin( rad ) * ring ) ) return false
			}

			return this.filled( point.x, point.y )
		}

		tilt( pivot: $bog_brelok_pivot_point ) {

			const center = this.center()
			if( !center ) return 0

			const dx = center.x - pivot.x
			const dy = center.y - pivot.y
			if( !dx && !dy ) return 0

			return Math.atan2( dx, dy ) * 180 / Math.PI
		}

	}

}
