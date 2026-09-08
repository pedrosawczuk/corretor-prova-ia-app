const BOUNDARY = 'test-multipart-boundary'

export function buildMultipartPayload(
	fileBuffer: Buffer,
	filename: string,
	contentType: string,
) {
	const payload = Buffer.concat([
		Buffer.from(
			`--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
		),
		fileBuffer,
		Buffer.from(`\r\n--${BOUNDARY}--\r\n`),
	])

	return {
		payload,
		headers: {
			'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
		},
	}
}
