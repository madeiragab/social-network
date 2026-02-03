/*
Render post text content:

- Detect URLs inside text
- Render URLs as clickable links (blue)
- Non-link text remains default color
- No rich text editor
- Simple and predictable behavior
*/
import React from 'react'

const URL_REGEX = /https?:\/\/[^\s]+/g

export default function RenderPostContent({ content }) {
  const parts = content.split(URL_REGEX)
  const urls = content.match(URL_REGEX) || []
  
  return (
    <p className="post-content">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {urls[index] && (
            <a href={urls[index]} target="_blank" rel="noopener noreferrer">
              {urls[index]}
            </a>
          )}
        </React.Fragment>
      ))}
    </p>
  )
}