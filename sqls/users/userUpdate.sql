IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'userUpdate')
	BEGIN
  DROP  Procedure  userUpdate
END
GO

CREATE PROCEDURE [dbo].userUpdate(
  @id					  INT,
  @firstName		NVARCHAR(100),
  @lastName			NVARCHAR(100),
  @displayName	NVARCHAR(200),
  @phone        VARCHAR(50),
  @socialInfo   VARCHAR(MAX)
)
AS
BEGIN
  SET NOCOUNT ON

  UPDATE	[dbo].[User]
	SET	firstName = @firstName,
			lastName = @lastName,
			displayName = @displayName,
      phone = @phone,
      socialInfo = @socialInfo,
			updated = GETDATE()
	WHERE	id = @id

  IF @@ERROR <> 0
  BEGIN
    RETURN -1
  END
END
GO
GRANT EXEC ON [dbo].userUpdate TO rpb_role
GO